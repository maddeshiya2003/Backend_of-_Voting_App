const express = require('express');
const router = express.Router();
const Candidate = require("../models/candidate");
const {jwtAuthMiddleware} = require("../jwtToken");
const User = require('../models/user');


// function for checking user is admin or not
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin"; //just like if else
  } 
  catch (err) {
    return false;
  }
}

// signup route 
router.post("/",jwtAuthMiddleware, async (req,res) => {
  try{

    // check user has admin or not
    if(! await checkAdminRole(req.user.id))
      return res.status(403).json({error:"You are not an admin."});

    // access data which sends from client side that is put in req.body by body parser
    const data = req.body;

    // make a blank object of User type and this User is of mongo schema
    const newCandidate = new Candidate(data);

    // save data in mongo 
    // newUser.save().then(() => console.log("Data Saaved")).catch((err) => "Some Error",err)
    const savedResponse = await newCandidate.save();
    console.log("Data Saved !!");

    // send saved response and token also
    res.status(200).json({savedResponse:savedResponse});
  } 
  catch(err){
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"})
  }

});

router.put("/:candidateId",jwtAuthMiddleware,async (req,res) => {
  try {

    // check user has admin or not
    if(!checkAdminRole(req.user.id))  
      return res.status(403).json({error:"You are not an admin."});

    const candidateId = req.params.candidateId;
    console.log(candidateId);
    const updatedCandidateData = req.body;
    console.log(updatedCandidateData);
    

    const response = await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
      runValidators:true,
      new:true
    }); 
    console.log(response);
    
    if(!response){
      return res.status(404).json({error:"Candidate Not Found!!"});
    }

    console.log("Candidate Data Updated !!");
    res.status(200).json(response);    
    
  } catch (err) {
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"})
  }
});

router.delete("/:candidateId",jwtAuthMiddleware,async (req,res) => {
  try {

    // check user has admin or not
    if(!checkAdminRole(req.user.id))  
      return res.status(403).json({error:"You are not an admin."});

    const candidateId = req.params.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId); 
    
    if(!response){
      return res.status(404).json({error:"Candidate Not Found!!"});
    }

    console.log("Candidate Deleted !!");
    res.status(200).json(response);    
    
  } catch (err) {
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"})
  }
});


// now routes for voting

router.get("/", async (req,res) => {
  try{
    const allCandidate = await Candidate.find();
    voteRecord = allCandidate.map((data) => {
      return {
        name:data.name,
        age:data.age,
        party: data.party
      }
    })
    return res.status(200).json(voteRecord);
  } 
  catch(err){
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"})
  }

});

//vote route for candidate

router.post("/vote/:candidateId",jwtAuthMiddleware,async (req,res) => {
  //no admin role
  // user can only vote once

  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {

    const candidate = await Candidate.findById(candidateId);
    if(!candidate){
      return res.status(404).json({message:"Candidate Not Found!!"});
    }

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User Not Found!!"});
    }
    
    if(user.isVoted){
      return res.status(400).json({message:"You have already voted!!"});
    }

    if(user.role === "admin"){
      return res.status(403).json({message:"Admin have not to vote!!"});
    }

    //push userid in votes and increase vote count and save
    candidate.votes.push({user:userId});
    candidate.voteCount++;
    await candidate.save();
    
    //mark isVoted as true and save 
    user.isVoted = true;
    await user.save();

    return res.status(200).json({message:"Vote record successfully!!"});
    
  } catch (err) {
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"})
  }

});

// shsow total vote count to each party

router.get("/vote/count", async(req,res) => {
  try {
    const allCandidate = await Candidate.find().sort({voteCount:"desc"})
    voteRecord = allCandidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount
      }
    })
    return res.status(200).json(voteRecord);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({error:"Internal Server Error!!"})
  }
})

module.exports = router;