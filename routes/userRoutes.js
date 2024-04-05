const express = require('express');
const router = express.Router();
const User = require("../models/user");
const {jwtAuthMiddleware,generateToken} = require("../jwtToken");

// signup route

router.post("/signup",async (req,res) => {
    try{
      // access data which sends from client side that is put in req.body by body parser
      const data = req.body;
  
      // make a blank object of User type and this User is of mongo schema
      const newUser = new User(data);
  
      // save data in mongo 
      // newUser.save().then(() => console.log("Data Saaved")).catch((err) => "Some Error",err)
      const savedResponse = await newUser.save();
      console.log("Data Saved !!");

      // this paylod is used for what to save in that token
      const paylod = {
        id : savedResponse.id
      }

      // to generate that token and this generateToken function is came from jwtToken.js file
      const token = generateToken(paylod);
      console.log("Genetared Token is:", token)

      // send saved response and token also
      res.status(200).json({savedResponse:savedResponse, token:token});
    } 
    catch(err){
      console.log(err);
      res.status(500).json({error:"Internal Server Error!!"})
    }
  
});

// login route

router.post("/login",async (req,res) => {
  try{
    // extract username password of login user who login 
    const {adharCardNumber,password} = req.body;

    // check adhar number, password are valid or not
    const user = await User.findOne({adharCardNumber:adharCardNumber});

    // if user doesnot match adhar number and password then return error
    if(!user || !(await user.comparePassword(password))) {
      return res.status(401).json({error:"Invalid Adhar Card Number or password"});
    }

    // generate token 
    const paylod = {
      id:user.id
    }
    const token = generateToken(paylod);

    // return token as response
    res.json({token});
    
  } 
  catch(err){
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"}) 
  }

});

// profile route

router.get("/profile", jwtAuthMiddleware, async (req,res) =>{
  try{
    const userData = req.user; //etract user data from token
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  } 
  catch(err){
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"})
  }
})


router.put("/profile/paassword",jwtAuthMiddleware,async (req,res) => {
  try {
    const userId = req.user.id; //etract id from token
    const {currentPassword, newPassword} = req.body; //extract current password and new password from request body that sends by web pages

    // find user by id
    const user = await User.findById(userId);

    // if user doesnot match password then return error
    if(!user || !(await user.comparePassword(currentPassword))) {
        return res.status(401).json({error:"Invalid Adhar Card Number or password"});
    }
    
    //updated password
    user.passward = newPassword;
    await user.save();


    console.log("Password Updated!!");
    res.status(200).json(response);    

  } catch (err) {
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"})
  }
});

module.exports = router;