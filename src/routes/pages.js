// Imports
const app = require("../puff-cheeks-cms");
const fse = require("fs-extra");
const express = require("express");
const path = require("path");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
const upload = require("multer")();
// Variables
const draftDir = app.locals.pageDir + "/drafts/";
const publishDir = app.locals.pageDir + "/published/";

/*
/ Create (POST)
*/
router.post("*", body("name").isString().isLength({ min: 2 }).trim(), (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array()[0].msg);
  }

  const slug = slugify(req.body.name, {
    remove: /[*+~.()'"!/:@]/g,
    lower: true,
  });

  const folder = slugify(req.body.folder, {
    remove: /[*+~.()'"!:@]/g,
    lower: true,
  });

  let link = path.join(folder, slug)
  if (link[0] == "/") {
    link = link.slice(1)
  }


  const pageData = {
    name: req.body.name,
    slug: slug,
    folder: folder,
    link: link,
    publishedDate: false,
    draftedDate: new Date().toString(),
  };

  // Update pages
  const result = app.locals.pages.add(pageData);

  if (result == -1) {
    return res.status(409).send("page already exists");
  }

  // Save Page Data to JSON
  const filePath = path.join(draftDir, folder, slug);
  fse
    .outputJson(`${filePath}.json`, {title:"", description:""})
    .then(() => {
      res.adminRender("sections/pages-accordion", {changedFolder: folder, new: pageData.link});
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).end();
    });
});

/*
/ Read (GET)
*/
router.get("/", (req, res) => {
  res.adminRender("templates/pages", {link: "pages"});
});

router.get("/*", (req, res) => {
  const link = req.url.slice(1)
  const page = app.locals.pages.findById(link)
  const file = path.join(draftDir, req.url);

  fse
    .readJson(file + ".json")
    .then((data) => {
      res.adminRender("pageEdit", {...data, ...page});
    })
    .catch((err) => {
      res.status(404).end("page does not exist");
    });
});

/*
/ Update (PUT)
*/
router.put("/*", upload.none(), (req, res) => {
  app.locals.pages.sortByKey(req.body.links)
  console.log(req.body)

  // check if page has moved folders
  for (let i = 0; i < req.body.links.length; i++) {
    page = app.locals.pages.findByKey(req.body.links[i])
    if (!page) {
      console.log(req.body.links);
    } 

    if (page.folder != req.body.folders[i]) {
      page.folder = req.body.folders[i];
      console.log(page.folder, page.slug)
      let link = path.join(page.folder, page.slug)
      if (link[0] == "/") {
        link = link.slice(1)
      }
      console.log(link, page.link)
      app.locals.pages.update[page]
    }
  }
  res.send("ok")
});


router.delete("/*", (req, res) => {
  const link = req.url.slice(1);

  if (link == "home") {
    return res.status(400).send("Cannot delete home page")
  }
  
  let page = app.locals.pages.findByKey(link)
  const result = app.locals.pages.deleteByKey(link);

  if (result == -1) {
    return res.status(404).send("page not found");
  }
  
  const folder = page.folder;
  const draftPath = path.join(draftDir, link) + ".json";
  const publishPath = path.join(publishDir, link) + ".json";
  const sitePath = path.join(app.locals.siteDir, link);
  fse
    .rm(draftPath)
    .then(()=>{
      if (page.publishedDate) return fse.rm(publishPath)
    })
    .then(()=>{
      if (page.publishedDate) return fse.remove(sitePath)
    })
    .then(() => {
      res.adminRender("sections/pages-accordion", {changedFolder: folder});
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).end();
    });
});

module.exports = router;
