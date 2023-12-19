const app = require("../puff-cheeks-cms");
const cookieSession = require("cookie-session");
const express = require("express");
const { body, validationResult } = require("express-validator");
const hashpass = require("../utils/hash-pass");
const path = require("path");
const router = express.Router();

router.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRET_KEY_1, process.env.SECRET_KEY_2],
    maxAge: 24 * 60 * 60 * 1000,
  })
);



router.use("/assets/public", express.static("./src/assets/public"));

/**
 * Only allow register if there is no admin
 */
router.get("/register", (req, res) => {
  if (app.locals.site.users.length == 0) {
    res.adminRender("register");
  } else {
    res.redirect(req.app.locals.site.url + "admin/login");
  }
});

/**
 * Register admin user
 */
router.post(
  "/register",
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password").isStrongPassword().trim().escape().withMessage("Password is too weak."),
  body("confirmPassword").trim().escape(),
  (req, res) => {
    if (app.locals.site.users.length > 0) {
      res.redirect(req.app.locals.site.url + "admin/login");
    } else {
      const errors = validationResult(req);


      if (errors.isEmpty()) {
        if (req.body.password === req.body.confirmPassword) {
          hashpass
            .hash(req.body.password)
            .then((key) => {
              console.log(key);

              const admin = { 
                email: req.body.email, 
                password: key, 
                role: "admin" 
              };

              app.locals.users.add(admin);
              res.redirect(app.locals.site.url + "admin/pages");
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          res.adminRender("register", { info: "Passwords do not match" });
        }
      } else {
        res.adminRender("register", { info: errors.array()[0].msg });
      }
    }
  }
);

router.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    next();
  } else if (app.locals.site.users.length > 0) {
    next();
  } else {
    res.redirect(req.app.locals.site.url + "admin/register");
  }
});

/*
 * Login User
 */
router.get("/login", (req, res) => {
  res.adminRender("login", { info: "Welcome Back!" });
});

router.post(
  "/login",
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password").trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const user = app.locals.users.findByKey(req.body.email)
      if (user) {

        if (user.failAttempts > 5) {
          const timeSpan = new Date().getTime() - user.failTime
          if (timeSpan > (1*60*1000)) {
            user.failTime = null;
            user.failAttempts = 0;
            app.locals.users.update(user)
          } else {
            return res.adminRender("login", { info: "Sorry, please try again in 5 mins" } );
          }
        }
        hashpass
          .compare(req.body.password, user.password)
          .then((result) => {
            if (result) {
              req.session.loggedin = true;
              res.redirect(req.app.locals.site.url + "admin/pages");
            } else {
              if (!user.failTime) {
                user.failTime = new Date().getTime()
                user.failAttempts = 1;
              } else {
                user.failAttempts += 1;
              }
              app.locals.users.update(user)
              res.adminRender("login", { info: "Invalid credentials" } );
            }
          });
      } else {
        res.adminRender("login", { info: "Invalid credentials" } );
      }
    } else {
      res.adminRender("login", { info: "Invalid credentials" } );
    }
  }
);

router.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    next();
  } else if (req.session.loggedin) {
    next();
  } else {
    req.session.original = req.url;
    res.redirect(req.app.locals.site.url + "admin/login");
  }
});

/**
 * Logout User
 */
router.get("/logout", (req, res) => {
  req.session.loggedin = false;

  res.adminRender("login", { info: "You are logged out" } );
})

router.get("/", (req, res) => {
  res.adminRender("templates/dashboard");
});

// routes
router.use("/pages", require("./pages"));
router.use("/images", require("./images"));

router.use("/assets", require("./assets"));
router.use("/page-folders", require("./page-folders"));
router.use("/assets", express.static("./src/assets"));
router.use("/assets/images", express.static("images"));


if (process.env.NODE_ENV === "development") {
  router.use("/dev", require("./dev"));
}

module.exports = router;
