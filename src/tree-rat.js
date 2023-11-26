#!/usr/bin/env node
require("dotenv").config({ override: true });

const PORT = process.env.PORT;
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
module.exports = app;

require("./utils/config").verify();
require("./utils/setup").variables();
require("./utils/setup").folders();
require("./utils/render").setup();
require("./utils/reload").devReload();
require("./utils/build").adminFiles();
require("./utils/logger").dev();


app.use(express.static("site"));

// app.use(function (req, res, next) {
//   res.setHeader(
//     'Content-Security-Policy',
//     "default-src 'self' ws://localhost:*; font-src 'self'; img-src 'self'; script-src 'self' localhost:*; style-src 'self'; frame-src 'self'"
//   );
//   next();
// });

// Admin Route
app.use("/admin", require("./routes/admin"));

app.listen(PORT, () => {
  console.log(`\n--\nTree Rat CMS Starting`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`Site: http://localhost:${PORT}/`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
  console.log("--");
});
