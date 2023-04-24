let express = require("express");
let app = express();
const PORT = process.env.PORT || 3000;
let path = require("path");
let mongoose = require("mongoose");
let session = require("express-session");
let validator = require("express-validator");
let methodOverride = require("method-override");
let fileUpload = require("express-fileupload");
let passport = require("passport");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log(`Connection to MongoDb is success!`))
  .catch((error) => console.log(" \n Connection error!!! \n\n", error));
// const db = 'mongodb+srv://Roman:Roman4321@cluster0.xy7fk.mongodb.net/CART?retryWrites=true&w=majority';

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//  Set public folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.locals.errors = null;

let Page = require("./models/page");
// Get all pages to pass to header.ejs
Page.find({})
  .sort({ sorting: 1 })
  .exec()
  .then((pages) => {
    app.locals.pages = pages;
  })
  .catch((e) => console.log(e));

// Get Category Model
var Category = require("./models/category");

//Get all categories to pass to header.ejs
Category.find()
  .then((categories) => {
    app.locals.categories = categories;
  })
  .catch((e) => console.log(e));

//Express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true },
  })
);

// Express Validator middleware
app.use(
  validator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      },
    },
  })
);

// Express Messages middleware
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Passport Config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// Set routes
let pages = require("./routes/pages");
let adminPages = require("./routes/admin_pages");
let adminCategories = require("./routes/admin_categories");
let adminProducts = require("./routes/admin_products");
let products = require("./routes/products");
let cart = require("./routes/cart");
let users = require("./routes/users.js");

app.use(pages);
app.use(adminPages);
app.use(adminCategories);
app.use(adminProducts);
app.use(products);
app.use(cart);
app.use(users);

app.listen(PORT, () => {
  console.log(`Server is listening PORT ${PORT}...`);
});

// async function start() {
//     try {
//       await mongoose.connect(db);
//       console.log(`Connection to MongoDb is success!`);
//       app.listen(PORT, () => {
//         console.log(`Server is listening PORT ${PORT}...`);
//       });
//     }
//     catch (error) {
//       console.log(" \n Connection error!!! \n\n", error);
//     }
// }

// start();
