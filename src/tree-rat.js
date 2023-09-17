#!/usr/bin/env node
require("dotenv").config({ override: true });
const fse = require("fs-extra");
const PORT = process.env.PORT;
const express = require("express");
const app = express();
const chokidar = require("chokidar");

fse.ensureDirSync("pages");
fse.ensureDirSync("site");

require("./utils/config").verify();

fse.outputFile("site/index.html", `<h1>Site</h1>
                                   <p>Hello World</p>`);

app.use(express.static("site"));

// Admin Route
app.use("/admin", require("./routes/admin"));

app.listen(PORT, () => {
  console.log(`\n--\nTree Rat CMS Starting`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`Site: http://localhost:${PORT}/`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
  //localhost:7533/
  http: console.log("--");
});


// chokidar.watch('pages').on('all', (event, path) => {
//   console.log(event, path);
// });