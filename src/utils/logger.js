const app = require("../tree-rat");

function dev() {
  if (process.env.NODE_ENV === "development") {
    // Log request
    app.use("/", (req, res, next) => {
      console.log(req.method, req.url);
      next();
    });
  }
}

module.exports = {dev}