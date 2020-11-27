const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks',auth,(req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    });
    task.save().then(()=>{res.status(201).send(task)}).catch((error)=>{res.status(400).send(error)});
})

router.get('/tasks',auth,async (req,res)=>{
   const match={}
   const sort = {}
   if(req.query.completed){
       match.completed = req.query.completed==='true' 
   }
   if(req.query.sortBy){
       const parts = req.query.sortBy.split(':')
       sort[parts[0]]=parts[1]==='desc'?-1:1;
   }
   try{
    await req.user.populate({
        path:'tasks',
        match,
        options:{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }
    }).execPopulate();
    //const task=await Task.find({owner:req.user._id});
    /*
    if(!task){
           res.status(404).send();
    }
    res.send(task);
    }*/
    if(!req.user.tasks){
        res.status(404).send();
    }
    res.send(req.user.tasks);
   } catch(e){
       res.status(500).send(e);
   }
})
/*
router.get('/tasks',(req,res)=>{
    Task.find({}).then((tasks)=>{
        res.send(tasks)
    }).catch((error)=>{
        res.status(500).send(error);
    })
});
*/
router.get('/tasks/:id',auth, async(req,res)=>{
 try{
     
    const task = await Task.findOne({_id:req.params.id,owner:req.user._id});
    if(!task){
        res.status(404).send();
    }
    res.send(task)
}catch(e){
    res.status(500).send(e);
}

})
/*
router.get('/tasks/:id',(req,res)=>{
    const _id=req.params.id;
    Task.findById(_id).then((task)=>{
        if(!task){
            return res.status(404).send("No Records Found");
        }
        res.send(task)
    }).catch((error)=>{
        res.status(500).send(error);
    })
})
*/
// Updating tasks

router.patch('/tasks/:id',auth,async (req,res)=>{
    const taskupdates = Object.keys(req.body);
    const taskallowedUpdates = ['description','completed'];
    const isallowed = taskupdates.every((update)=>{
        return taskallowedUpdates.includes(update)
    })
    if(!isallowed){
        return res.status(400).send("cannot update this property");
    }
    try{
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id});

    //const task = await Task.findById(req.params._id);
    if(!task){
        return res.status(400).send("couldn't find any data related to this id");
    }
    taskupdates.forEach(update=>task[update] = req.body[update]);
    await task.save();
    //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    
    res.send(task)
    }catch(e){
        res.status(404).send({})
    }
})

// Deleting Task
router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const task =await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        //const task =await Task.findByIdAndDelete(req.params.id);
        if(!task){
            return res.status(400).send("No Data found");
        }
        res.send(task);
    }catch(e){
        res.status(404).send(e)
    }
})


module.exports = router;