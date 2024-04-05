const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age : {
        type:Number,
        required:true
    },
    email: {
        type:String
    },
    mobile: {
        type:String
    },
    address:{
        type:String,
        required:true
    },
    adharCardNumber: {
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["voter","admin"],
        default:"voter"
    },
    isVoted:{
        type:Boolean,
        default:false
    }
});

userSchema.pre("save", async function(next) {
    const person = this;

    try {

        if(!person.isModified("password"))  return next();

        // random salt like: !@#$%^&*()?|/\[}+=<.,
        const salt = await bcrypt.genSalt(10);

        // mix user given password and salt to genetate hashedpassword
        const hashedPassword = await bcrypt.hash(person.password,salt)

        // override user password to hashedpassword
        person.password = hashedPassword;

        next();
 
    } catch (err) {
        next(err);
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const isMatch = bcrypt.compare(candidatePassword,this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;
