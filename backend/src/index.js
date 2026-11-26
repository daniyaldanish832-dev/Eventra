const express = require("express")
const app = express()
require("./model/connection")
const User = require("./model/User")
const cors = require("cors")
const bodyParser = require("body-parser")

app.use(cors())

app.use(bodyParser.json())

app.listen(3000)

app.get("/alluser",(req,res)=>{
    User.find().then((response)=>{
        res.send("response")
    })
})


app.post("/register",(req,res)=>{
    User.create(req.body).then(()=>{
        res.status(200).send({ message: "User Registered Successfully"})
    })
})

app.post("/login", async (req,res)=>{
    try{
        const existingUser = await User.findOne({ email: req.body.email})

        if (!existingUser) {
            return res.status(401).send({ message: "Email not Found"});
        }
        if (existingUser.password !== req.body.password) {
            return res.status(401).send({message: "Password does not match"});
        }
        res.send({
            message : "Login Successfully",
            user : {
                email : existingUser.email,
                name : existingUser.name,
                role : existingUser.role || "Attendee"
            },
            User : {
                email : existingUser.email,
                name : existingUser.name,
                role : existingUser.role || "Attendee"
            }
        })
    }catch (e){
        res.status(500).send({message : e.message})
    }
})



console.log("Connected")