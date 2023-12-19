const express = require("express");
const router = express.Router();

router.get("/",(req, res) => {
  res.adminRender('templates/dev', {link: "dev"})
})

module.exports = router;
