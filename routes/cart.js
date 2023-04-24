let express = require("express");
let router = express.Router();
let session = require("express-session");

// Get Product model
let Product = require("../models/product");

router.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);

/*
 * GET add product to cart
 */
router.get("/cart/add/:product", (req, res) => {
  let slug = req.params.product;

  Product
  .findOne({ slug: slug })
  .then((p)=>{
    console.log(typeof req.session.cart);

    if (typeof req.session.cart == "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(p.price).toFixed(2),
        image: "/product_images/" + p._id + "/" + p.image,
      });
    } 
    else {  // cart exists!!!
      let cart = req.session.cart;
      let newItem = true;

      for (let i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }

      if (newItem) {
        cart.push({
          title: slug,
          qty: 1,
          price: parseFloat(p.price).toFixed(2),
          image: "/product_images/" + p._id + "/" + p.image,
        });
      }
    }
    // console.log(typeof req.session.cart);
    // console.log(req.session.cart);
    req.flash("success", "Product added!");
    res.redirect("back");
  })
  .catch((e)=>console.log(e))
});

router.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

/*
 * GET checkout page
 */
router.get('/cart/checkout',  (req, res) => {
  if (req.session.cart && req.session.cart.length == 0) {
      delete req.session.cart;
      res.redirect('/cart/checkout');
  } 
  else {
      res.render('checkout', {
          title: 'Checkout',
          cart: req.session.cart
      });
  }

});

/*
 * GET update product
 */
router.get("/cart/update/:product", (req, res) => {
  var slug = req.params.product;
  var cart = req.session.cart;
  var action = req.query.action;

  for (var i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch (action) {
        case "add":
          cart[i].qty++;
          break;
        case "remove":
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        default:
          console.log("update problem");
          break;
      }
      break;
    }
  }

  req.flash("success", "Cart updated!");
  res.redirect("/cart/checkout");
});

/*
 * GET clear cart
 */
router.get("/cart/clear", (req, res) => {
  delete req.session.cart;

  req.flash("success", "Cart cleared!");
  res.redirect("/cart/checkout");
});

/*
 * GET buy now
 */
router.get("/cart/buynow", (req, res)=> {
  delete req.session.cart;
  res.sendStatus(200);
});

// Exports
module.exports = router;
