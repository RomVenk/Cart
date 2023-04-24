let express = require("express");
let router = express.Router();
let Page = require("../models/page");
let auth = require('../config/auth');
let isAdmin = auth.isAdmin;


router.get("/admin/pages",  isAdmin, (req, res) => {
  Page.find({})
    .sort({ sorting: 1 })
    .exec()
    .then((pages)=> {
      res.render("admin/pages", {
        pages: pages,
      });
    })
    .catch((e)=>console.log('jhjjjj', e))
});

//Get add page
router.get("/admin/add-page", isAdmin, (req, res) => {
  let title = '';
  let slug = "";
  let content = "";
  res.render("admin/add_page", {
    title: title,
    slug: slug,
    content: content,
  });
});

//Post add page
router.post("/admin/add-page", (req, res) => {
  req.checkBody("title", 'Title must have a value!').notEmpty();
  req.checkBody("content", 'Content must have a value!').notEmpty(); 
    let { title, content } = req.body;
    var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
    const errors = req.validationErrors();
    if (errors) {
      res.render("admin/add_page", {
        errors: errors,
        title: title,
        slug: slug,
        content: content,
      });
    }
    else {
      Page
      .findOne({ title: title })
      .then((page)=>{
        if(page) {
          req.flash("danger", "Page title exists, choose another.");
          res.render("admin/add_page", {
            title: title,
            slug: slug,
            content: content,
          });
        } 
        else {
          var page = new Page({
            title: title,
            slug: slug,
            content: content,
            sorting: 100,
          });

          page
          .save()
          .then(()=>{
            Page.find({})
            .sort({ sorting: 0 })
            .exec()
              .then((pages)=>{
                req.app.locals.pages = pages;
              })
              .catch((e)=>console.log("eRRRRRrr", e)); 
            req.flash("success", "The page was added succsefully!");
            res.redirect("/admin/pages");
          })
          .catch((e)=>console.log("eRRRRRrr", e));
        }
      })
      .catch((e)=>console.log("errrrr", e));  
    }
})
     
    

/*
 * GET edit page
 */
router.get("/admin/pages/edit-page/:id", isAdmin, (req, res) => {
  Page
  .findById(req.params.id)
  .then((page)=>{
    res.render("admin/edit_page", {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id,
    })
  })
  .catch((e)=>console.log(e)) 
});

/*
 * Edit page
 */
router.put("/admin/pages/edit-page/:id", isAdmin, (req, res) => {
  req.checkBody("title", 'Title must have a value!').notEmpty();
  req.checkBody("content", 'Content must have a value!').notEmpty(); 
  var {title, content}= req.body;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  var id = req.params.id;

  const errors = req.validationErrors();
    if (errors) {
      res.render("admin/add_page", {
        errors: errors,
        title: title,
        slug: slug,
        content: content,
      });
    }
    else {
      Page
      .findOne({ slug: slug, _id: { $ne: id }})
      .then((page) => {
        if (page) {
          res.render("admin/edit_page", {
            title: title,
            slug: slug,
            content: content,
            id: id,
          });
        } 
    else {
      Page
      .findByIdAndUpdate(id, {title, slug, content})
      .then(()=> {
        Page.find({})
        .sort({ sorting: 1 })
        .exec() 
        .then((pages)=>{
          req.app.locals.pages = pages;
        })
        .catch((e)=>console.log(e)) 
        req.flash("success", "The page was edited succsefully!");
        res.redirect("/admin/pages/edit-page/" + id)
      })
      .catch((e)=>console.log(e)) 
    }
   })
   .catch((e)=>console.log(e))
  }
});


/*
 *  Delete page
 */
router.delete("/admin/pages/:id", isAdmin, (req, res) => {   
  Page.findByIdAndRemove(req.params.id)
  .then(()=>{
    Page.find({})
      .sort({ sorting: 1 })
      .exec()
      .then((pages)=>{
        req.app.locals.pages = pages;
      })
      .catch((e)=>console.log(e));
    //req.flash("success", "The page was removed succefully!"); // чомусь на 1 reload затримка
    res.redirect("/admin/pages");
  })
  .catch((e)=>console.log(e)) 
});

/*
 * POST reorder pages
 */

module.exports = router;
