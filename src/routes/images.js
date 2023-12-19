const app = require("../puff-cheeks-cms");
const path = require("path")
const fse = require("fs-extra");
const express = require("express");
const router = express.Router();
const { processUploadImg } = require("../utils/img-proc");
const multer = require("multer");
const sharp = require("sharp");
const slugify = require("slugify");

// Variables
const imgDir = app.locals.imgDir;
const imgOgDir = imgDir + "/original";
fse.ensureDirSync(imgOgDir);

// IMAGE STORAGE WITH MULTER
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imgOgDir);
  },
  filename: function (req, file, callback) {
    callback(null, niceImageName(file.originalname));
  },
});
var upload = multer({ storage: storage });


/**
 * Read (GET)
 */
router.get("/*", (req, res) => {
  res.adminRender("templates/images", {link: "images"});
});

/*
/ Create (POST)
*/
router.post("/", upload.array("pic"), (req, res) => {
  let newImages = []
  Promise.all(
    req.files.map(async (file) => {
      const metadata = await sharp(file.path).metadata();
      console.log(metadata)
      const imageData = {
        name: path.parse(file.filename).name,
        uploadEpochTime: Date.now(),
        modifiedEpochTime: "",
        generatedEpochTime: "",
        height: metadata.height,
        width: metadata.width,
        og: { 
              format: metadata.format, 
              height: metadata.height, 
              width: metadata.width 
            },
      };
      app.locals.images.add(imageData);
      newImages.unshift(imageData);

      await processUploadImg(file.filename, imgOgDir);
    })
  )
    .then(() => {
      res.adminRender('layouts/image-gallery-new', {images: newImages});
    })
    .catch((err) => {
      console.error(err);
    });
});

function niceImageName(imageFile) {
  const pathObject = path.parse(imageFile);

  let name = slugify(pathObject.name, {
    remove: /[*+~.()'"!/:@]/g,
    lower: true,
  });

  if (app.locals.site.images[imageFile]) {
    name += "-copy";
  }

  return name + pathObject.ext;
}


module.exports = router;