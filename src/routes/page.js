/*
/ Update (PUT)
*/
router.put("/*", upload.none(), (req, res) => {
  const link = req.url.slice(1)
  const pageFile = path.join(draftDir, link)+".json";
  const pageData = req.body;

  // Update pages
  let page = app.locals.pages.findById(link)
  page.draftedDate = new Date().toString();
  app.locals.pages.update(page)

  // Save Page Data to JSON
  fse
    .outputFile(pageFile, JSON.stringify(pageData, null, 2))
    .then(() => {
      res.adminRender("layouts/page-form", pageData );
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).end();
    });
});