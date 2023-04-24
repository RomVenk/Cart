let express = require("express");
let router = express.Router();
let passport = require("passport");
let bcrypt = require("bcryptjs");

// Get Users model
let User = require("../models/user");

/*
 * GET register
 */
router.get("/users/register",  (req, res) => {
  res.render("register", {
    title: "Register",
  });
});

/*
 * POST register
 */
router.post("/users/register", (req, res)=> {
  let {name, email, username, password, password2 }  = req.body;
    req.checkBody("name", "Name is required!").notEmpty();
    req.checkBody("email", "Email is required!").isEmail();
    req.checkBody("username", "Username is required!").notEmpty();
    req.checkBody("password", "Password is required!").notEmpty();
    req.checkBody("password2", "Passwords do not match!").equals(password);

    const errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors,
        user: null,
        title: "Register",
      });
    } 
    else {
        User
        .findOne({ username: username })
        .then((user) => {
            if (user) {
              req.flash("danger", "Username exists, choose another!");
              res.redirect("/users/register");
            } 
            else {
            var user = new User({
                name: name,
                email: email,
                username: username,
                password: password,
                admin: 0,
            });

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) console.log(err);

                user.password = hash;

                user.save(function (err) {
                    if (err) console.log(err);
                    else {
                      req.flash("success", "You are now registered!");
                      res.redirect("/users/login");
                    }
                });
                });
            });
        }
        })
        .catch((e)=>console.log(e))
      }
});

/*
 * GET login
 */
router.get("/users/login", (req, res) => {
  if (res.locals.user) 
  res.redirect("/");

  res.render("login", {
    title: "Log in",
  });
});

/*
 * POST login
 */
router.post("/users/login", (req, res, next)=> {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

/*
 * GET logout
 */
router.get("/users/logout", (req, res, next)=> {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash("success", "You are logged out!");
    res.redirect("/users/login");
  }); 
});

// Exports
module.exports = router;
