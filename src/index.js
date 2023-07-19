// Importing modules 
const express = require("express")
const app = express()
const path = require("path")
const hbs = require("hbs")
const port = 3000
const collection = require("./mongo")
const bcrypt = require("bcrypt")

// body parser
const bp = require('body-parser')

// cookie parser
const cp = require('cookie-parser');
const { default: mongoose } = require("mongoose")

const templatepath = path.join(__dirname, "../template")
const publicPath = path.join(__dirname, '../public')

// --------------------------------------------------------------------------

app.use(cp());
app.use(bp.json());

app.use(express.json())
app.set("view engine", "hbs")
app.set("views", templatepath)
app.use(express.static(publicPath))
app.use(express.urlencoded({ extended: false }))

// --------------------------------------------------------------------------

// Update input feild
app.get("/home", (req, res) => {
    const { name, _id } = req.cookies.user
    console.log("coookie",req.cookies.user)
    res.render("home", { name: name, id: _id });
});

// GET
app.get("/", (req, res) => {
    res.render("login")
})
app.get("/home", (req, res) => {
    res.render("home")
})
app.get("/signup", (req, res) => {
    res.render("signup")
})


app.post("/signup", async (req, res) => {
    try {
        const { name, password } = req.body;
        // Hash the password with a salt of 10 rounds
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            name: name,
            password: hashedPassword,
        };

        await collection.insertMany([data]);
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred. Please try again later.");
    }
});

// --------------------------------------------------------------------------------------
// POST-LOGIN
app.post("/login", async (req, res) => {
    try {
        // console.log(req.body)
        const user = await collection.findOne({ name: req.body.name })
        // console.log(user)
        if (user) {
            const passCheck = await bcrypt.compare(req.body.password, user.password);
            console.log("pass",passCheck)
            if (passCheck) {
                res.cookie('user', user)
                res.redirect("/home")
            } else {
                res.send("WRONG PASSWORD! Please try again")
            }
        } else {
            res.send("User not found")
        }


    } catch (error) {
        console.error(error)
        // console.log("hello")
        res.status(500).send("An error occurred. Please try again later.")
    }
})


// UPDATE Operation
app.post("/home", async (req, res) => {
    console.log(req.body)
    const reqBody = req.body
    const id = new mongoose.Types.ObjectId(reqBody.id)
    const data = {
        name: reqBody.name,

    }


    try {
        const result = await collection.updateOne({ _id: id }, { $set: data });
        const updatedUser = await collection.findOne({ _id: id });
        console.log(result, updatedUser)
        if (result.matchedCount === 1 && result.modifiedCount === 1 && updatedUser) {
            const alertScript = `<script>alert('User Details Updated');
            window.location.reload();
            </script>
            `;  
            res.cookie('user', updatedUser)
            res.render("home", { alertScript });

        } else {
            res.status(404)
        }
    } catch (error) {
        console.log(error)
    }
})

// DELETE 
app.post("/delete", async (req, res) => {
    const id = req.body.id
    console.log("hello", req.body)
    await collection.deleteOne({ _id: id })
    const alertScript = `<script>alert('User Deleted');
    window.location.href = '/';
    </script>
    `;  
    res.render("home", { alertScript });
})

// --------------------------------------------------------------------------

app.listen(port, () => {
    console.log(`Port is now connected to ${port} `)
})