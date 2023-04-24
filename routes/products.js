let express = require("express");
let router = express.Router();
let path = require("path");
let fs = require("fs-extra");
// let auth = require('../config/auth');
// let isUser = auth.isUser;

// Get Product model
let Product = require("../models/product");

// Get Category model
let Category = require("../models/category");


/*
 * GET all products
 */
router.get("/a/products", (req, res) => {
//router.get("/a/products", isUser, (req, res) => {
  Product.find()
  .then((products)=>{
    res.render("all_products", {
      title: "All products",
      products: products,
    });
  })
  .catch((e)=>console.log('Error', e))  
});


/*
 * GET products by category
 */
router.get("/products/:category", (req, res) => {
  var categorySlug = req.params.category;

  Category
  .findOne({ slug: categorySlug })
  .then(function(c) {
    Product
    .find({category: categorySlug})
    .then(function (products) {
      res.render("cat_products", {
        title: c.title,
        products: products,
      });
    })
    .catch((e)=>console.log(e))
  })
  .catch((e)=>console.log(e))
});

/*
 * GET product details
 */
router.get("/products/:category/:product", (req, res) => {
  var galleryImages = null;
  //var loggedIn = (req.isAuthenticated()) ? true : false;

  Product.findOne({ slug: req.params.product })
  .then((product)=>{
    var galleryDir = "public/product_images/" + product._id + "/gallery";
      fs.readdir(galleryDir,  (err, files) => {
        if (err) console.log(err);
         else {
          galleryImages = files;
          res.render("product", {
            title: product.title,
            p: product,
            galleryImages: galleryImages,
            //loggedIn: loggedIn,
          });
        }
      });

  })
  .catch((e)=>console.log(' \n Displaying product error! \n\n', e))
});

// Exports
module.exports = router;
