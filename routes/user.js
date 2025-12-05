const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const isAuthenticated = require('../middleware.js');

const Listing = require("../models/listing");


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser,(err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to A2Z Accomdation");
        res.redirect("/listings");
        })
        
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }

})
);

router.get("/login", async (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login",
 saveRedirectUrl,
passport.authenticate("local", { 
    failureRedirect: '/login', 
    failureFlash: true  }),
 async (req, res) => {
     //req.flash("success", "Welcome You are Succesfully Logged In");
     req.flash("success", `Welcome ${req.user.username}, you are successfully logged in!`);
     
     let redirectUrl = res.locals.redirectUrl || "/listings";
    
     res.redirect(redirectUrl);
});

router.post("/logout", (req, res, next) =>{
    req.logout((err) => {
        if(err) {
            next(err);
        }
        req.flash("success", "You are logged Out!");
        res.redirect("/listings");
    })
});



// // mY profile area

// // GET /users/:id - View Profile
// router.get('/users/:id', async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id).populate('listings');
//       if (!user) {
//         req.flash('error', 'User not found');
//         return res.redirect('/listings');
//       }
//       res.render('users/profile', { user });
//     } catch (err) {
//       console.log(err);
//       req.flash('error', 'Something went wrong!');
//       res.redirect('/listings');
//     }
//   });
// GET /users/:id/listings - Show user's listings
router.get('/users/:id/listings', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('listings');
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/listings');
    }

    // ✅ Pass both `user` and `listings` to the view
    res.render('users/listings', { user, listings: user.listings });
  } catch (err) {
    console.log(err);
    req.flash('error', 'Something went wrong!');
    res.redirect('/listings');
  }
});



// GET /users/:id/edit - Edit Profile Form
router.get('/users/:id/edit', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user || user._id.toString() !== req.user._id.toString()) {
        req.flash('error', 'You do not have permission to edit this profile');
        return res.redirect('/listings');
      }
      res.render('users/edit', { user });
    } catch (err) {
      console.log(err);
      req.flash('error', 'Something went wrong!');
      res.redirect('/listings');
    }
  });


  // POST /users/:id/edit - Update Profile
router.post('/users/:id/edit', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user || user._id.toString() !== req.user._id.toString()) {
        req.flash('error', 'You do not have permission to edit this profile');
        return res.redirect('/listings');
      }
  
      // Update the user's profile details
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      await user.save();
  
      req.flash('success', 'Profile updated successfully!');
      res.redirect(`/users/${user._id}`);
    } catch (err) {
      console.log(err);
      req.flash('error', 'Something went wrong!');
      res.redirect(`/users/${req.params.id}/edit`);
    }
  });
  
  // GET /users/:id/listings - View user's listings
router.get('/users/:id/listings', async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate('listings');
      if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/listings');
      }
      res.render('users/listings', { user });
    } catch (err) {
      console.log(err);
      req.flash('error', 'Something went wrong!');
      res.redirect('/listings');
    }
  });
  
module.exports = router;