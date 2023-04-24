let express = require("express");
let router = express.Router();
let auth = require('../config/auth');
let isUser = auth.isUser;

// Get Page model
let Page = require("../models/page");

/*
 * GET /
 */
router.get("/",  (req, res) => {
  Page
  .findOne({ slug: "home" })
  .then(function (page) {
    res.render("index", {
      title: page.title,
      content: page.content,
    });
  })
  .catch((err)=> console.log(err))
});

/*
 * GET a page
 */
router.get("/:slug", isUser, (req, res) => {
  var slug = req.params.slug;

  Page
  .findOne({ slug: slug })
  .then(function(page) {
    if (!page) {
      res.redirect("/");
    } else {
      res.render("index", {
        title: page.title,
        content: page.content,
      });
    }
  })
  .catch((err)=> console.log(err))
});

module.exports = router;
