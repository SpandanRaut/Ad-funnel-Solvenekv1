import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
const chrome = spawn(
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=9223",
    `--user-data-dir=${path.resolve(".qa/chrome")}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
let tab;
for (let i = 0; i < 50; i++) {
  try {
    const list = await (await fetch("http://127.0.0.1:9223/json")).json();
    tab = list.find((x) => x.type === "page");
    if (tab) break;
  } catch {
    // Chrome may still be starting its debugging endpoint.
  }
  await new Promise((r) => setTimeout(r, 200));
}
if (!tab) throw new Error("Chrome failed to start");
const ws = new WebSocket(tab.webSocketDebuggerUrl);
const heartbeat = setInterval(() => {}, 1000);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});
let id = 0;
const pending = new Map();
const errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(m.error);
    else p.resolve(m.result);
  } else if (m.method === "Runtime.exceptionThrown")
    errors.push(
      m.params.exceptionDetails.exception?.description ||
        m.params.exceptionDetails.text,
    );
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const key = ++id;
    const timeout = setTimeout(() => {
      pending.delete(key);
      reject(new Error(`CDP timed out: ${method}`));
    }, 10000);
    pending.set(key, {
      resolve: (result) => {
        clearTimeout(timeout);
        resolve(result);
      },
      reject: (err) => {
        clearTimeout(timeout);
        reject(err);
      },
    });
    ws.send(JSON.stringify({ id: key, method, params }));
  });
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails)
    throw new Error(
      result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text,
    );
  return result.result.value;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const navigate = async (route) => {
  await send("Page.navigate", { url: `http://127.0.0.1:3000${route}` });
  for (let i = 0; i < 50; i++) {
    await wait(200);
    if (await evaluate('!!document.querySelector(".site-header")')) break;
  }
  await wait(250);
};
const assert = (condition, message) => {
  if (!condition)
    throw new Error(`${message}\nRuntime errors: ${errors.join("\n")}`);
  console.log("PASS", message);
};
async function click(selector) {
  assert(
    await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`),
    `element exists: ${selector}`,
  );
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await wait(150);
}
async function fill(selector, value) {
  await evaluate(
    `(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));el.dispatchEvent(new Event('blur'))})()`,
  );
  await wait(100);
}
async function screenshot(name) {
  await evaluate("document.fonts.ready");
  const metrics = await send("Page.getLayoutMetrics");
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport,
    height: Math.ceil(metrics.cssContentSize.height),
    deviceScaleFactor: 1,
    mobile: false,
  });
  await wait(250);
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  await fs.writeFile(
    `screenshots/${name}.png`,
    Buffer.from(shot.data, "base64"),
  );
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
}
let viewport = 1440;
try {
  await fs.mkdir("screenshots", { recursive: true });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  for (const width of [1440, 375]) {
    viewport = width;
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await navigate("/");
    await evaluate("sessionStorage.clear()");
    await navigate("/confirmed");
    assert(
      (await evaluate("location.pathname")) === "/",
      "route guards redirect to application",
    );
    await screenshot(`${width}-1-landing`);
    await fill("#email", "invalid");
    assert(
      await evaluate(
        'document.body.textContent.includes("Please enter a valid email address.")',
      ),
      "invalid email shows inline error",
    );
    await fill("#industry", "Home Services");
    await fill("#name", "Alex Morgan");
    await fill("#email", "alex@example.com");
    await fill("#phone", "+1 (555) 123-4567");
    assert(
      await evaluate(
        '!document.querySelector("form button[type=submit]").disabled',
      ),
      "valid application enables continue",
    );
    await click("form button[type=submit]");
    await wait(1300);
    assert(
      (await evaluate("location.pathname")) === "/schedule",
      "application submits and navigates",
    );
    await screenshot(`${width}-2-schedule`);
    await navigate("/schedule");
    assert(
      (await evaluate("location.pathname")) === "/schedule",
      "application persists through reload",
    );
    await click(".calendar-grid button.available");
    await click(".time-slots button");
    assert(
      await evaluate('document.querySelector(".confirm-button").disabled'),
      "consent required before booking",
    );
    await click(".consent input");
    assert(
      await evaluate('!document.querySelector(".confirm-button").disabled'),
      "slot and consent enable booking",
    );
    await click(".confirm-button");
    await wait(1400);
    assert(
      (await evaluate("location.pathname")) === "/confirmed",
      "booking navigates to confirmation",
    );
    await screenshot(`${width}-3-confirmed`);
    await navigate("/confirmed");
    assert(
      await evaluate(
        '/[AP]M/.test(document.querySelector(".details-card").textContent)',
      ),
      "chosen time survives reload",
    );
    assert(
      await evaluate(
        'document.querySelector("video").readyState >= 1 && Math.round(document.querySelector("video").duration) === 56',
      ),
      "placeholder video loads with 56-second duration",
    );
    await click(".video-play");
    await wait(350);
    assert(
      await evaluate('!document.querySelector("video").paused'),
      "custom video play control works",
    );
    await click(".video-controls button");
    await click(".confirmed-faq .accordion:nth-of-type(6) button");
    assert(
      (await evaluate(
        'document.querySelector(".confirmed-faq .accordion:nth-of-type(6) button").getAttribute("aria-expanded")',
      )) === "true",
      "accordion opens",
    );
    await evaluate(
      'window.icsText="";window.oldCreateObjectURL=URL.createObjectURL;URL.createObjectURL=blob=>{blob.text().then(text=>window.icsText=text);return window.oldCreateObjectURL(blob)}',
    );
    await click(".details-card .primary-button");
    await wait(250);
    assert(
      await evaluate(
        'window.icsText.includes("BEGIN:VEVENT") && window.icsText.includes("DTSTART:")',
      ),
      "calendar generates an ICS event",
    );
    const overflow = await evaluate(
      "document.documentElement.scrollWidth>innerWidth",
    );
    assert(!overflow, `${width}px has no horizontal overflow`);
  }
  assert(errors.length === 0, `no browser runtime errors (${errors.length})`);
  await fs.writeFile(
    "screenshots/qa-results.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        engine: "Chrome CDP, offline Vue/Vite preview (not Nuxt)",
        viewports: [1440, 375],
        runtimeErrors: errors,
        result: "passed",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.log(
    "Failure diagnostics",
    await evaluate(
      "({url:location.href,body:document.body.innerText.slice(0,2000),html:document.body.innerHTML.slice(0,1000)})",
    ),
  );
  throw error;
} finally {
  ws.close();
  clearInterval(heartbeat);
  chrome.kill();
}
