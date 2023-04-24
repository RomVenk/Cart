let express = require("express");
let router = express.Router();
let auth = require('../config/auth');
let isAdmin = auth.isAdmin;

// Get Category model
let Category = require("../models/category");

/*
 * GET category index
 */
router.get("/admin/categories", isAdmin, (req, res) => {
  Category
  .find()
  .then((categories) => {
    res.render("admin/categories", {
      categories: categories,
    });
  })
  .catch((e)=>console.log(e))
})

/*
 * GET add category
 */
router.get("/admin/categories/add-category", isAdmin, (req, res) => {
  let title = "";
  res.render("admin/add_category", {
    title: title,
  });
});

/*
 * POST add category
 */
router.post("/admin/categories/add-category", (req, res) => {
  req.checkBody('title', 'Title must have a value.').notEmpty();
  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/add_category", {
      errors: errors,
      title: title,
    });
  }
  else {
    Category
    .findOne({ slug: slug })
    .then((category) => {
      if (category) {
        req.flash('danger', 'Category title exists, choose another.');
        res.render("admin/add_category", {
          title: title,
        });
      } 
      else {
        var category = new Category({
          title: title,
          slug: slug,
        });

        category
        .save()
        .then(() => {
          Category
          .find()
          .then((categories) => {
              req.app.locals.categories = categories;
          })
          .catch((e)=>console.log(e))
          req.flash('success', 'Category added!');
          res.redirect("/admin/categories");
        });
      }
    })
    .catch((e)=>console.log(e))
  } 
});

/*
 * GET edit category
 */
router.get("/admin/categories/edit-category/:id", isAdmin, (req, res) => {
  Category
  .findById(req.params.id)
  .then((category) => {
    res.render("admin/edit_category", {
      title: category.title,
      id: category._id,
    });
  })
  .catch((e)=>console.log(e))
});

/*
 *  Edit category
 */
router.put("/admin/categories/edit-category/:id", isAdmin, (req, res) => {
    req.checkBody('title', 'Title must have a value.').notEmpty();
    var title = req.body.title;
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();
      if (errors) {
        res.render("admin/edit_category", {
          errors: errors,
          title: title,
          id: id,
        });
      } 
      else {
        Category.findOne({ slug: slug, _id: { $ne: id }})
         .then((category) => {
           if (category) {
            req.flash('danger', 'Category title exists, choose another.');
            res.render("admin/edit_category", {
              title: title,
              id: id,
            });
           } 
           else {
            Category
            .findByIdAndUpdate(id, {title, slug})
            .then(()=>{
              Category
              .find()
              .then((categories) => {
                  req.app.locals.categories = categories;
              })
              .catch((e)=>console.log(e)) 
              req.flash('success', 'Category edited!');
              res.redirect("/admin/categories/edit-category/" + id);
            })
            .catch((e)=>console.log(e)) 
           }
         })
      }
})
      
/*
 * Delete category
 */
router.delete("/admin/categories/:id", isAdmin, (req, res) => {
  Category
  .findByIdAndRemove(req.params.id)
  .then(()=>{
    Category
    .find()
    .then((categories) => {
      req.app.locals.categories = categories;
    })
    .catch((e)=>console.log(e))  
  })
  .catch((e)=>console.log(e)) 
  //req.flash('success', 'Category delited!'); //чомусь  пізніше спрацьовує
  res.redirect("/admin/categories");
})
  
// Exports
module.exports = router;
