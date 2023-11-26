const app = require("../tree-rat")
const ejs = require("ejs")
const fse = require("fs-extra");

/**
 * Render Middleware
 */
function setup() {

  app.use((req, res, next) => {
    /**
     * Renders admin pages and sends the response to client
     * @param {string} file - The EJS view file to render, no filetype needed
     * @param {Object} data - Specific page data, added to the page object
     */
    res.adminRender = (file, data) => {
      if (!data) data = {}
      ejs.renderFile("./src/views/" + file + ".ejs", { page: data, ...app.locals }, (err, html) => {
        if (err) {
          return res.send(`<body >${err.message.replace(/(?:\n)/g, "<br>")}</body>`);
        }
        res.send(html);
      });
    };
    next();
  });
}

module.exports = { setup }

