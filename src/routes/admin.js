const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send(`<h1>Admin</h1>
            <p>Hello World</p>`)
})

module.exports = router;
