const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/event_data").then(()=>{

    console.log("Connected Data Successfully")
})