const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Binary } = require('mongodb');
const Userschema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
    },
    email:{
        type:String,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid");
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("age must be a positive number");
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            
            if(value.includes('password')){
                throw new Error("Password cannot be password");
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    pics:{
        type:Buffer
    }
},{
    timestamps:true
})
Userschema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})
Userschema.methods.toJSON =function(){
    const user = this;
    const UserObject = user.toObject()
    delete UserObject.password;
    delete UserObject.tokens;
    return UserObject
}
Userschema.methods.generateAuthToken = async function(){
      const user = this;
      const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);
      //The push() adds elements to the end of an array and returns the new length of the array. Thus your return here is invalid.
    //The concat() method is used to merge arrays. Concat does not change the existing arrays, but instead returns a new array.
      user.tokens = user.tokens.concat({token});
      await user.save();
          return token;

};

// Check for login Credentials
Userschema.statics.findByCredentials=async (email,password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error("Invalid email");
    }
    const isMatch = await bcrypt.compare(password,user.password);
  
    if(! isMatch){
        throw new Error("Invalid Password");
    }
        return user;

}
// Hash the password
Userschema.pre('save',async function(next){
    const user = this;
   if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password,8);
   }
    next();
});

Userschema.pre('remove',async function(next){
const user=this;
 await Task.deleteMany({owner:user._id})
 next()
})
const User = mongoose.model('User',Userschema);


module.exports=User;