const app = require("../tree-rat")
const cookieSession = require("cookie-session");
const express = require("express");
const router = express.Router();

router.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRET_KEY_1, process.env.SECRET_KEY_2],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

router.get("/", (req, res) => {
  console.log(process.cwd());
  res.adminRender("dashboard");
});

/**
 * Create Admin user on first start up
 */

router.get("/register", (req, res) => {
  if (app.locals.users.length == 0) {
    res.redirect(req.app.locals.site.url + "admin/login");
  } else {
    res.adminRender("register", { page: { info: "" } });
  }
});

router.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    next();
  } else if (app.locals.users.length > 0)  {
    next();
  } else {
    res.redirect(req.app.locals.site.url + "admin/register");
  }
});


module.exports = router;
