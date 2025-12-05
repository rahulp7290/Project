const Listing  = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

//yaha se
const User = require('../models/user');
//yaha tak







module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm = (req, res) => {
    
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {path: "author",},}) 
    .populate("owner");
     if(!listing){
        req.flash("error", "Listing Not Exist");
      return  res.redirect("/listings");

      
     }
     console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {

let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  })
    .send();
 
   

    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url,"..", filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

   newListing.geometry = response.body.features[0].geometry;

   let savedListing = await newListing.save();
      console.log(savedListing); 

      //chat gpt wala hai
 // 👇 This part is what you're missing to associate it with the user
 const user = await User.findById(req.user._id);
 user.listings.push(savedListing._id);
 await user.save();
 //yaha tak

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
};
module.exports.updateListing = async (req, res) => {
    try {
      const { id } = req.params;
      const cleanedId = id.trim();
  
      let listing = await Listing.findById(cleanedId);
  
      if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
      }
  
      if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to edit this listing.");
        return res.redirect(`/listings/${cleanedId}`);
      }
  
      const updatedListing = await Listing.findByIdAndUpdate(cleanedId, { ...req.body.listing }, { new: true });
  
      if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
      }
  
      req.flash("success", "Listing updated!");
      res.redirect(`/listings/${updatedListing._id}`);
      
    } catch (err) {
      console.error("Update Listing Error:", err);
      req.flash("error", "Something went wrong while updating the listing.");
      res.redirect("/listings");
    }
  };
  

  module.exports.deletedListing =async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}