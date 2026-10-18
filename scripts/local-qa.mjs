// Optional offline fallback: render the Vue UI with locally available Vite tools.
// This verifies interactions and layouts, but does not replace a Nuxt build.
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd();
const tooling = process.env.SOLVENEK_QA_TOOLING;
if (!tooling)
  throw new Error(
    "Set SOLVENEK_QA_TOOLING to a local node_modules containing vite, @vitejs/plugin-vue, vue, vue-router, and pinia.",
  );
const { createServer } = await import(
  pathToFileURL(path.join(tooling, "vite/dist/node/index.js"))
);
const { default: vue } = await import(
  pathToFileURL(path.join(tooling, "@vitejs/plugin-vue/dist/index.mjs"))
);
const components = (await fs.readdir("components"))
  .filter((name) => name.endsWith(".vue"))
  .map((name) => name.slice(0, -4));
await fs.mkdir(".nuxt", { recursive: true });
await fs.writeFile(
  ".nuxt/tsconfig.json",
  JSON.stringify({
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      paths: { "~/*": ["../*"] },
    },
  }),
);
const server = await createServer({
  root,
  configFile: false,
  publicDir: "public",
  oxc: { tsconfigRaw: {} },
  plugins: [
    {
      name: "nuxt-offline-qa",
      enforce: "pre",
      transform(code, id) {
        if (
          !id.endsWith(".vue") ||
          !id.replaceAll("\\", "/").startsWith(root.replaceAll("\\", "/"))
        )
          return;
        const imports = components
          .filter(
            (name) =>
              path.basename(id) !== `${name}.vue` && code.includes(`<${name}`),
          )
          .map((name) => `import ${name} from '/components/${name}.vue'`)
          .join("\n");
        return code.includes("<script")
          ? code.replace(/(<script[^>]*>)/, `$1\n${imports}\n`)
          : `<script setup>\n${imports}\n</script>\n${code}`;
      },
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (
            req.url === "/" ||
            req.url === "/schedule" ||
            req.url === "/confirmed"
          ) {
            res.setHeader("Content-Type", "text/html");
            res.end(
              await server.transformIndexHtml(
                req.url,
                `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Caslon+Text:wght@400;700&display=swap"></head><body><div id="app"></div><script type="module" src="/scripts/qa-entry.mjs"></script></body></html>`,
              ),
            );
            return;
          }
          next();
        });
      },
    },
    vue(),
  ],
  resolve: {
    alias: {
      "~": root,
      vue: path.join(tooling, "vue/dist/vue.runtime.esm-bundler.js"),
      "vue-router": path.join(
        tooling,
        "vue-router/dist/vue-router.esm-bundler.js",
      ),
      pinia: path.join(tooling, "pinia/dist/pinia.mjs"),
      "lucide-vue-next": path.join(
        root,
        ".qa/lucide/dist/esm/lucide-vue-next.js",
      ),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    watch: { ignored: ["**/.qa/**"] },
    fs: { allow: [root, tooling] },
  },
  css: { postcss: { plugins: [] } },
});
await server.listen();
server.printUrls();
