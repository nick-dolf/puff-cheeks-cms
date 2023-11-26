const app = require("../tree-rat");
const fse = require("fs-extra");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");

const draftDir = app.locals.pageDir + "/drafts/";

router.post(
  "*",
  body("name").isString().isLength({ min: 2 }).trim(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array()[0].msg);
    }

    const slug = slugify(req.body.name, {
      remove: /[*+~.()'"!/:@]/g,
      lower: true,
    });

    const result = app.locals.pageFolders.add({slug: slug, name: req.body.name})

    if (result == -1) {
      return res.status(409).send("folder already exists");
    }

    fse
      .mkdir(draftDir + slug)
      .then(() => {
        res.adminRender("sections/pages-accordion");
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
);

router.put("/", (req, res) => {
  app.locals.pageFolders.sortByKey(req.body.folders)

  res.send("ok")
})

router.delete("/:slug", (req, res) => {
  const slug = req.params.slug;

  if (slug == "/") {
    return res.status(403).res.send("cannot delete /")
  }

  const result = app.locals.pageFolders.deleteByKey(slug);

  if (result) {
    fse
      .remove(draftDir + slug)
      .then(() => {
          res.adminRender("sections/pages-accordion", {changedFolder: slug});
      })
      .catch((err) => {
        res.status(400).send("unable to delete folder");
        console.error(err);
      });
  } else {
    res.status(400).send("unable to delete folder");
  }
});

module.exports = router;
