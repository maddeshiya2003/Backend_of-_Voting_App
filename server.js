const express = require('express');
const app = express();
const db = require("./db");
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

app.get("/", async (req,res) => {
    
    return res.status(200).send(
        "Welcome to Voting app, here you can follow this Readme file for routing the ends points: <b>https://github.com/maddeshiya2003/Backend_of-_Voting_App/blob/main/README.md</b>");
    
  });

// routes for user
const userRoute = require("./routes/userRoutes");
app.use("/user", userRoute)

// routes for candidate
const candidateRoute = require("./routes/candidateRoutes");
app.use("/candidates", candidateRoute); //role must be admin

app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})

