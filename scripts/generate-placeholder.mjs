// Creates original synthetic placeholder footage locally; no remote media dependency.
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
const processHandle = spawn(
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--remote-debugging-port=9224",
    `--user-data-dir=${path.resolve(".qa/video-chrome")}`,
    "http://127.0.0.1:3000",
  ],
  { windowsHide: true, stdio: "ignore" },
);
const heartbeat = setInterval(() => {}, 1000);
try {
  let tab;
  for (let i = 0; i < 50; i++) {
    try {
      tab = (await (await fetch("http://127.0.0.1:9224/json")).json()).find(
        (x) => x.type === "page",
      );
      if (tab) break;
    } catch {
      // Chrome may still be starting its debugging endpoint.
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let counter = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.id) {
      pending.get(data.id)?.(data.result);
      pending.delete(data.id);
    }
  });
  const send = (method, params) =>
    new Promise((resolve) => {
      const id = ++counter;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  await send("Page.navigate", { url: "http://127.0.0.1:3000" });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const result = await send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async()=>{
  const canvas=new OffscreenCanvas(640,400),ctx=canvas.getContext('2d'),chunks=[];
  const encoder=new VideoEncoder({output:chunk=>{const bytes=new Uint8Array(chunk.byteLength);chunk.copyTo(bytes);chunks.push({time:chunk.timestamp,key:chunk.type==='key',data:btoa(String.fromCharCode(...bytes))})},error:error=>{throw error}});
  encoder.configure({codec:'vp8',width:640,height:400,bitrate:150000,framerate:2});
  for(let frame=0;frame<112;frame++){
   ctx.fillStyle='#050b14';ctx.fillRect(0,0,640,400);
   for(let layer=0;layer<3;layer++){const y=270+layer*30;const drift=Math.sin(frame/28+layer)*12;const gradient=ctx.createLinearGradient(0,y,0,y+100);gradient.addColorStop(0,'rgba(93,155,224,.5)');gradient.addColorStop(.14,'rgba(20,50,80,.6)');gradient.addColorStop(1,'rgba(5,11,20,1)');ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(0,y+drift);ctx.bezierCurveTo(220,y+65,410,y-115,640,y-90+drift);ctx.lineTo(640,400);ctx.lineTo(0,400);ctx.fill()}
   ctx.fillStyle='white';ctx.font='600 18px sans-serif';ctx.fillText('S O L V E N E K',42,55);ctx.font='32px Georgia';ctx.fillText('Turn attention into',42,125);ctx.fillText('booked business.',42,167);ctx.font='14px sans-serif';ctx.fillStyle='rgba(255,255,255,.65)';ctx.fillText('Placeholder introduction · replace with your founder video',42,218);
   const videoFrame=new VideoFrame(canvas,{timestamp:frame*500000,duration:500000});encoder.encode(videoFrame,{keyFrame:frame%2===0});videoFrame.close();if(frame%12===0)await encoder.flush();
  }await encoder.flush();encoder.close();return chunks;
 })()`,
  });
  if (result.exceptionDetails)
    throw new Error(
      result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text,
    );
  const uint = (value, size) => {
    if (!size) size = Math.max(1, Math.ceil(Math.log2(value + 1) / 8));
    const b = Buffer.alloc(size);
    b.writeUIntBE(value, 0, size);
    return b;
  };
  const vint = (value) => {
    for (let size = 1; size <= 6; size++)
      if (value < 2 ** (size * 7) - 1) {
        const b = uint(value, size);
        b[0] |= 1 << (8 - size);
        return b;
      }
  };
  const element = (hex, data) =>
    Buffer.concat([Buffer.from(hex, "hex"), vint(data.length), data]);
  const integer = (hex, value) => element(hex, uint(value));
  const string = (hex, value) => element(hex, Buffer.from(value));
  const float = (hex, value) => {
    const b = Buffer.alloc(8);
    b.writeDoubleBE(value);
    return element(hex, b);
  };
  const header = element(
    "1a45dfa3",
    Buffer.concat([
      integer("4286", 1),
      integer("42f7", 1),
      integer("42f2", 4),
      integer("42f3", 8),
      string("4282", "webm"),
      integer("4287", 2),
      integer("4285", 2),
    ]),
  );
  const info = element(
    "1549a966",
    Buffer.concat([
      integer("2ad7b1", 1000000),
      float("4489", 56000),
      string("4d80", "Solvenek"),
      string("5741", "Solvenek"),
    ]),
  );
  const tracks = element(
    "1654ae6b",
    element(
      "ae",
      Buffer.concat([
        integer("d7", 1),
        integer("73c5", 1),
        integer("83", 1),
        string("86", "V_VP8"),
        integer("23e383", 500000000),
        element("e0", Buffer.concat([integer("b0", 640), integer("ba", 400)])),
      ]),
    ),
  );
  const chunks = result.result.value;
  const clusters = [];
  for (let i = 0; i < chunks.length; i += 2) {
    const base = chunks[i].time / 1000;
    const blocks = chunks.slice(i, i + 2).map((chunk) => {
      const time = Buffer.alloc(2);
      time.writeInt16BE(chunk.time / 1000 - base);
      return element(
        "a3",
        Buffer.concat([
          Buffer.from([0x81]),
          time,
          Buffer.from([chunk.key ? 0x80 : 0]),
          Buffer.from(chunk.data, "base64"),
        ]),
      );
    });
    clusters.push(
      element("1f43b675", Buffer.concat([integer("e7", base), ...blocks])),
    );
  }
  await fs.mkdir("public/videos", { recursive: true });
  await fs.writeFile(
    "public/videos/founder-placeholder.webm",
    Buffer.concat([
      header,
      element("18538067", Buffer.concat([info, tracks, ...clusters])),
    ]),
  );
  console.log("Created 56-second original placeholder video.");
  ws.close();
} finally {
  clearInterval(heartbeat);
  processHandle.kill();
}
