const express = require('express');
const app = express();
const db = require("./db");
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

// routes for user
const userRoute = require("./routes/userRoutes");
app.use("/user", userRoute)

// routes for candidate
const candidateRoute = require("./routes/candidateRoutes");
app.use("/candidate", candidateRoute); //role must be admin

app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})

