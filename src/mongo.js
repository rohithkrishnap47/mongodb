const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/loginsignup")

    .then(() => {
        console.log("Connected to Database")
    })
    .catch(() => {
        console.log("Failed to connect to database , Try again !")
    })              
const loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})
const collection = new mongoose.model("logincollection", loginschema)
module.exports=collection