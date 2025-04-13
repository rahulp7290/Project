if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
 
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/accomdation";

const dbUrl = process.env.ATLASDB_URL; 









// Connect to MongoDB
main()
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));




const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) =>{
    console.log("ERROR in MONGO SESSION STORE", err);
})


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge: 7 * 24 * 60 * 1000, 
        httpOnly: true,
    },
};

// Passport serialization and deserialization
passport.serializeUser(function(user, done) {
    done(null, user._id);  // Only store the user ID in the session
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
  


// Routes
// app.get("/", (req, res) => {
//     res.send("Hi, I am Root");
// });

app.get('/test-flash', (req, res) => {
    req.flash('success', 'Flash is working!');
    res.redirect('/');
});


app.use(session(sessionOptions));
app.use(flash());

 app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

app.use((req, res, next) => {
 res.locals.success = req.flash("success");
 res.locals.error = req.flash("error");
 res.locals.currUser = req.user;
// console.log(res.locals.success);
 next();
});


app.get('/', (req, res) => {
     res.redirect('/listings');
  });
  
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User ({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//  let registeredUser = await  User.register(fakeUser, "helloworld");
//  res.send(registeredUser);
// });

// chtgpt
// Route to render the user's profile page
app.get("/users/profile", async (req, res) => {
    try {
        // Fetch the logged-in user and populate the listings
        const user = await User.findById(req.user._id).populate("listings");
        
        // Render the profile page with user data (including listings)
        res.render("users/profile", { user });
    } catch (error) {
        console.log(error);
        res.redirect("/listings"); // Redirect if something goes wrong
    }
});


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// Catch-All 404 Error Handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
    //  res.status(statusCode).render("error.ejs", { err });
});

// Start Server
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});


