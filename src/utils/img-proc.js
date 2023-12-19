const sharp = require("sharp");
const fse = require("fs-extra");
const path = require("path");
const app = require("../puff-cheeks-cms");

async function processUploadImg(img, srcDir) {
  await fse.mkdirs(srcDir + "/thumb");

  const name = path.parse(img).name

  await sharp(srcDir + "/" + img)
    .resize({
      width: 250,
      height: 250,
      fit: "contain",
      background: {r: 0, g: 0, b: 0, alpha: 0}
    })
    .png()
    .toFile(srcDir + "/thumb/" + name + ".png");
}

function publishImg(img, options, promises) {
  let image = app.locals.images.findById(img)

  if(!image) return "";

  let imgName = path.parse(image.name).name + `-${image.uploadEpochTime}`;

  let promise = convertImages(image, imgName, options)

  if(promises) {
    promises.push(promise)
  }

  return imgName;
}

async function convertImages(image, imgName, options) {
  let siteImgDir = path.join(app.locals.siteDir, "assets/images/");
  let imgDir = path.join(app.locals.imgDir, "original");

  // Produce fallback jpg
  if(!fse.existsSync(siteImgDir + imgName + ".jpg")) {
    await sharp(`${imgDir}/${image.name}`)
      .resize({
        width: options.width,
        height: options.height,
        fit: "contain",
        background: "#FFF",
      })
      .jpeg()
      .toFile(siteImgDir + imgName + ".jpg");
  };

  // Produce WebP in different Widths
  for (width of options.widths) {
    const fname = `${siteImgDir}${imgName}-${width}.webp`
    const imgWidth = width

    if(!fse.existsSync(fname)) {
      await sharp(`${imgDir}/${image.name}`).resize({ width: imgWidth }).webp().toFile(fname);
    }
  }
}

module.exports = { processUploadImg, publishImg };
