const mongoose = require("mongoose")

var UserSchema = mongoose.Schema({
    name : String,
    email : String,
    password : String,
})


var userModel = mongoose.model("users",UserSchema)
module.exports = userModel