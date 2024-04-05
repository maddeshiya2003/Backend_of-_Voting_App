const jwt = require ("jsonwebtoken");
const { model } = require("mongoose");

const jwtAuthMiddleware = (req,res,next) => {

    // first check the request headers has authorization or not
    const  authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error:"Token Not found!"})

    // extract token from request url/api
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error:"unauthorized"})

    try {
        //verify token
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        // to attached token or user information to request object and we can take any name like req.userTokenData or req.userEncodedData etc.
        req.user = decoded;
        next();

    } catch (err) {
        console.log(err);
        res.status(401).json({error:"Invalid Token"});
    }
     
}

const generateToken =(userData) => {
    // this sign function is used for generete token 
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:24*60*60*30}); // for one month  
}

module.exports = {jwtAuthMiddleware,generateToken};