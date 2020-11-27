const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const upload = multer({
    //dest:'Images/ProfilePics',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('This extension is not supported'))
        }
        cb(undefined,'true');
    }
})

router.post('/users',async (req,res)=>{
    const user_1 = new User(req.body);
   
    try{
        const token = await user_1.generateAuthToken();
         await user_1.save();
         res.status(201).send({user_1,token})

    }catch(e){
        res.status(400).send(e)
    }
    
    
})
//Login
router.post('/users/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.send({user,token})

    }catch(e){
        res.status(400).send(e)
    }
})
//
router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>token.token!==req.token);
        await req.user.save();
        res.send("Logged out")
    }catch(e){
        res.status(500).send(e)
    }
})
router.post('/users/logoutall',auth,async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save();
        res.send("Logged out from all acounts")
    }catch(e){
        res.status(500).send(e)
    }
})
router.get('/users',auth,async (req,res)=>{
    // 500 ->when server is down
    try{
        const users = await User.find({});
        res.send(users)
    }catch(e){
        res.status(500).send(e)
    }
    
});

router.post('/users/me/profilePic',auth,upload.single('upload'),async (req,res)=>{
    try{
        const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
        req.user.pics = buffer;
        await req.user.save();    
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
},(error,req,res,next)=>res.status(400).send(error.message))

router.delete('/users/me/profilePic',auth,async (req,res)=>{
    try{
        req.user.pics = undefined;
        await req.user.save();    
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
},(error,req,res,next)=>res.status(400).send(error.message))

router.get('/users/:id/profilePic',async (req,res)=>{
    try{
     const user = await User.findById(req.params.id);
     if(!(user || user.pics) ){
         throw new Error()
     }
     res.set('Content-type','image/jpg');
     res.send(user.pics)
    }catch(e){
        res.status(404).send()
    }
})
router.get('/users/me',auth,async (req,res)=>{
   
   try{

        const user = await req.user
        if(!user){
            res.status(404).send("Could not find any record")
        }
        res.send(user)
    }catch(e){
        res.status(500).send(e);
    }
  
  
})
//Updating users
router.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','age','email','password'];
    const isAllowed = updates.every((update)=>{
        return allowedUpdates.includes(update)
    });
    if(!isAllowed){
        return res.status(400).send("cannot update this property");
    }
    try{
    
        updates.forEach((update)=>{
            req.user[update]=req.body[update];
        });
       await   req.user.save();
        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        
        res.send( req.user)
    }catch(e){
        res.status(404).send({})
    }
})
// End of Updating
//Deleting Tasks
router.delete('/users/me',auth,async (req,res)=>{
    try{
        /*const user = await User.findByIdAndDelete(req.user._id);
        if(!user){
            return res.status(400).send("No data found");
        }*/
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(404).send()
    }
})

module.exports=router;