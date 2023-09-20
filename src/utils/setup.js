const fse = require("fs-extra");
const app = require("../tree-rat");
const path = require("path")
const PuffCheeksStorage = require("puff-cheeks")

/**
 * Sets up local variables
 */
function variables() {
  const config = fse.readJsonSync("tree-rat.json");

  app.locals.site = {};

  // Site Url
  if (process.env.NODE_ENV === "development") {
    app.locals.site.url = "/";
    app.locals.env = "development";
  } else if (process.env.NODE_ENV === "staging") {
    app.locals.site.url = config.stagingUrl;
    app.locals.env = "staging";
  } else {
    app.locals.site.url = config.productionUrl;
    app.locals.env = "production";
  }

  app.locals.enableGzip = config.enableGzipCompression;
  app.locals.autoPrefixer = config.enableAutoPrefixer;

  // Directory paths
  app.locals.siteDir = path.join(process.cwd(), "site");
  app.locals.pageDir = path.join(process.cwd(), "pages");
  app.locals.viewDir = path.join(process.cwd(), "views");
  app.locals.imgDir = path.join(process.cwd(), "images");
  app.locals.fileDir = path.join(process.cwd(), "files");

  // Setup Json "database"
  app.locals.pages = new PuffCheeksStorage("pages", "link");
  app.locals.site.pages = app.locals.pages.data;

  app.locals.folders = new PuffCheeksStorage("folders", "slug")
  app.locals.site.folders = app.locals.folders.data;

  app.locals.blocks = new PuffCheeksStorage("blocks", "slug");
  app.locals.site.blocks = app.locals.blocks.data;

  app.locals.sections = new PuffCheeksStorage("sections", "slug");
  app.locals.site.sections = app.locals.sections.data;

  app.locals.images = new PuffCheeksStorage("images", "name");
  app.locals.site.images = app.locals.images.data;

  app.locals.files = new PuffCheeksStorage("files", "name");
  app.locals.site.files = app.locals.files.data;

  app.locals.users = new PuffCheeksStorage("users", "email", "secrets");
  app.locals.site.users = app.locals.users.data;
}

/**
 * Set up Directories
 */
function folders() {
  fse.ensureDirSync(app.locals.siteDir);
  fse.ensureDirSync(app.locals.siteDir + "/assets/images");
  fse.ensureDirSync(app.locals.pageDir);
  fse.ensureDirSync(app.locals.pageDir + "/drafts");
  fse.ensureDirSync(app.locals.pageDir + "/published");
  fse.ensureDirSync(app.locals.viewDir);
  fse.ensureDirSync(app.locals.imgDir);
  fse.ensureDirSync(app.locals.fileDir);
}

module.exports = { variables, folders };
