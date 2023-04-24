let express = require("express");
let router = express.Router();
let fs = require("fs-extra");
let resizeImg = require("resize-img");
let auth = require('../config/auth');
let isAdmin = auth.isAdmin;

// Get Product model
let Product = require("../models/product");

// Get Category model
let Category = require("../models/category");

/*
 * GET products index
 */

router.get("/admin/products", isAdmin, (req, res)=> {
  var count;

  Product
  .count()
  .then((c)=> count = c)
  .catch((e)=>console.log(e))
  
  Product
  .find()
  .then((products)=> {
    res.render("admin/products", {
      products: products,
      count: count,
    });
  })
  .catch((e)=>console.log(e))
});

/*
 * GET add product
 */
router.get("/admin/products/add-product", isAdmin,  (req, res) => {
  var title = "";
  var desc = "";
  var price = "";

  Category
  .find()
  .then((categories)=> {
    res.render("admin/add_product", {
      title: title,
      desc: desc,
      categories: categories,
      price: price,
    });
  })
  .catch((e)=>console.log(e))
});

/*
 * POST add product
 */
router.post("/admin/products/add-product", (req, res) => {
    if (req.files) var imageFile = req.files.image.name;
    else {
      imageFile = "";
    }
    // var imageFile =
    //   typeof req.files.image !== "undefined" ? req.files.image.name : "";  //чомусь не спрацьовує
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image!').isImage(imageFile);
    
    var title = req.body.title;
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();
    if (errors) {
        Category
        .find()
        .then((categories) => {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        })
        .catch((e)=>console.log(e))
    } 
    else {
    Product
    .findOne({ slug: slug })
    .then((product) =>{
      if (product) {
        req.flash("danger", "Product title exists, choose another.");
        Category
        .find()
        .then((categories) => {
          res.render("admin/add_product", {
            title: title,
            desc: desc,
            categories: categories,
            price: price,
          });
        })
        .catch((e)=>console.log(e))
      } 
      else {
        var price2 = parseFloat(price).toFixed(2);

        var product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          price: price2,
          category: category,
          image: imageFile,
        });

        product
          .save()
          .then(() => {
            fs.mkdirp("public/product_images/" + product._id);
            fs.mkdirp("public/product_images/" + product._id + "/gallery");
            fs.mkdirp(
              "public/product_images/" + product._id + "/gallery/thumbs"
            ).then(() => {
              if (imageFile != "") {
                console.log(typeof req.files.image);
                let productImage = req.files.image;
                let uploadPath =
                  "public/product_images/" + product._id + "/" + imageFile;

                productImage.mv(uploadPath, function (err) {
                  return console.log(err);
                });
              }

              req.flash("success", "Product added!");
              res.redirect("/admin/products");
            });
          })

          .catch(() => console.log("dddd"));
      }
    })
    .catch((e)=>console.log(e))
  }
  }
);

/*
 * GET edit product
 */
router.get("/admin/products/edit-product/:id", isAdmin, (req, res) => {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category
  .find()
  .then((categories) => {
    Product
    .findById(req.params.id)
    .then((p) =>{
        var galleryDir = "public/product_images/" + p._id + "/gallery";
        var galleryImages = null;

        fs.readdir(galleryDir, function (err, files) {
          if (err) console.log(err);
          else {
            galleryImages = files;

            res.render("admin/edit_product", {
              title: p.title,
              errors: errors,
              desc: p.desc,
              categories: categories,
              category: p.category.replace(/\s+/g, "-").toLowerCase(),
              price: parseFloat(p.price).toFixed(2),
              image: p.image,
              galleryImages: galleryImages,
              id: p._id,
            });
          }
        });
      }
    );
  })
  .catch((e)=>{
    console.log(e)
    res.redirect("/admin/products");
  })
});

/*
 * Edit product
 */
router.put("/admin/products/edit-product/:id", isAdmin, (req, res) => {
  if (req.files) var imageFile = req.files.image.name;
  else {
    imageFile = "";
  }

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('desc', 'Description must have a value.').notEmpty();
  req.checkBody('price', 'Price must have a value.').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  let {title, desc, price, category, pimage}  = req.body;
  let slug = title.replace(/\s+/g, "-").toLowerCase();
  let id = req.params.id;

  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/products/edit-product/" + id);
  } 
  else {
    Product
    .findOne({ slug: slug, _id: { $ne: id }})
    .then((p)=>{
      if (p) {
        req.flash("danger", "Product title exists, choose another.");
        res.redirect("/admin/products/edit-product/" + id);
      } 
      else {
        Product
        .findById(id)
        .then(function (p) {     //переробити на апдейт!!! поексперементувати з самим завантаженням
          p.title = title;
          p.slug = slug;
          p.desc = desc;
          p.price = parseFloat(price).toFixed(2);
          p.category = category;
          if (imageFile != "") {
            p.image = imageFile;
          }
          p
          .save()
          .then(() => {
            if (imageFile != "") {
              if (pimage != "") {
                fs.remove("public/product_images/" + id + "/" + pimage)
              }
              var productImage = req.files.image;
              var path = "public/product_images/" + id + "/" + imageFile;
              productImage.mv(path, function (err) {
              return console.log(err)});
            }

            req.flash("success", "Product edited!");
            res.redirect("/admin/products/edit-product/" + id);
          })
          .catch(() => console.log("eRRRORS"));
        })
       .catch((e)=>console.log(e))
      }})
    .catch((e)=>console.log(e))
  }
})
    
/*
 * Delete product
 */
router.delete("/admin/products/:id", isAdmin, (req, res) => {
  var id = req.params.id;
  var path = "public/product_images/" + id;
  Product
    .findByIdAndRemove(id)
    .then(()=>{
      fs.remove(path, function (err) {
        if (err) console.log(err);
        else {
          res.redirect("/admin/products"); 
        }
      });
    })
    .catch((e)=>console.log(e))
});
 

/*
 * PUT product gallery
 */
router.put("/admin/products/product-gallery/:id", isAdmin, (req, res) => {
  var productImage = req.files.file;
  var id = req.params.id;
  var path = "public/product_images/" + id + "/gallery/" + req.files.file.name;
  var thumbsPath =
    "public/product_images/" + id + "/gallery/thumbs/" + req.files.file.name;

  productImage.mv(path, function (err) {
    if (err) console.log(err);

    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(
      function (buf) {
        fs.writeFileSync(thumbsPath, buf);
      }
    );
  });

  res.sendStatus(200);
});

/*
 * Delete image
 */
// поправити на метод Delete
router.get("/admin/products/delete-image/:image", isAdmin, (req, res) => {
  var originalImage = "public/product_images/" + req.query.id + "/gallery/" + req.params.image;
  var thumbImage = "public/product_images/" + req.query.id + "/gallery/thumbs/" + req.params.image;

  fs.remove(originalImage, function (err) {
    if (err) console.log(err);
    else {
      fs.remove(thumbImage, function (err) {
        if (err) console.log(err);
        else {
          req.flash("success", "Image deleted!");
          res.redirect("/admin/products/edit-product/" + req.query.id);
        }
      });
    }
  });
});



// Exports
module.exports = router;
