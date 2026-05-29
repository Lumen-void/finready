const lifecycleEvent = process.env.npm_lifecycle_event || "";

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = lifecycleEvent === "dev" ? "development" : "production";
}

const http = require("http");
const next = require("next");

const isDev = process.env.NODE_ENV === "development";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev: isDev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        handle(req, res);
      })
      .listen(port, () => {
        console.log(
          `FinReady Next.js server listening on ${hostname}:${port} (mode: ${isDev ? "development" : "production"})`
        );
      });
  })
  .catch((error) => {
    console.error("Failed to start FinReady server", error);
    process.exit(1);
  });
