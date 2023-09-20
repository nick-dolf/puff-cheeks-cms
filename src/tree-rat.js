#!/usr/bin/env node
require("dotenv").config({ override: true });

const PORT = process.env.PORT;
const express = require("express");
const app = express();
module.exports = app;



require("./utils/config").verify();
require("./utils/setup").variables();
require("./utils/setup").folders();
require("./utils/render").setup();
require("./utils/reload").setup();

app.use(express.static("site"));

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


// chokidar.watch('pages').on('all', (event, path) => {
//   console.log(event, path);
// });