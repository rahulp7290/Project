const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");



module.exports.isLoggedIn = (req, res, next) => {
    
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listings");

        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    

    let listing = await Listing.findById(req.params.id.trim());

    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You Dont Have Permission to Do This")
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.validateListing = (req, res, next) => {
    let{ error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message ).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let{ error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message ).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review")
        return res.redirect(`/listings/${id}`);
    }

    next();

    // middleware/auth.js

module.exports = (req, res, next) => {
    if (!req.isAuthenticated()) {  // Check if user is logged in
      req.flash('error', 'Please log in to access this page');
      return res.redirect('/login');  // Redirect to login page if not logged in
    }
    next();  // If the user is authenticated, move to the next middleware/route
  };
  
};

