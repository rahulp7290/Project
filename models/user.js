const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema ({
    email: {
        type: String,
        required: true
    },

    // ye jo part hai na ye hum chat gpt se nikale hai
    listings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing"
        }
    ],
  

}, {
    timestamps: true  // Adds createdAt and updatedAt automatically

    // yahatak hai
    
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema );