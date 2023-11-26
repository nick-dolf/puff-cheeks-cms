const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const sass = require("sass");
const fse = require("fs-extra")

/**
 * Build admin javascript and scss 
 */
function adminFiles() {
  const sassResult = sass.compile("./src/views/main.scss", {
    style: "compressed",
  });

  postcss([ autoprefixer ]).process(sassResult.css, {from: undefined}).then(result => {
    result.warnings().forEach(warn => {
      console.warn(warn.toString())
    })

    fse.outputFileSync("./src/assets/public/style.css", result.css);
  })

  // build admin script
  let out = "";
  fse
    .readdir("./src/browser")
    .then((files) => {
      for (file of files) {
        let contents = fse.readFileSync("./src/browser/" + file);
        out += contents.toString() + "\n";
      }
    })
    .then(() => {
      fse.outputFile("./src/assets/admin-script.js", out);
    });
  
}

module.exports = { adminFiles }