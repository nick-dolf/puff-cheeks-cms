const app = require("../puff-cheeks-cms");
const chokidar = require("chokidar");
const livereload = require("livereload");
const liveReloadServer = livereload.createServer();
const connectLivereload = require("connect-livereload");

/**
 * Starts Live reload in development environment
 */
function devReload() {
  if (process.env.NODE_ENV === "development") {
    app.use(connectLivereload());

    liveReloadServer.server.once("connection", () => {
      setTimeout(() => {
        liveReloadServer.refresh("/");
      }, 100);
    });
  }
}

module.exports = { devReload };
