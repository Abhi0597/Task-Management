const express = require('express');
//from greater version of 9 for env-cmd we need to add -f 
const { ObjectID } = require('mongodb');
const app = express();
const UserRouter = require('./routers/user');
const TaskRouter = require('./routers/task');
require('./db/mongoose');
const port = process.env.PORT;

const multer = require('multer');
const upload = multer({
    dest:'Images'
})
app.post('/upload',upload.single('upload'),(req,res)=>{
    res.send()
})
app.use(express.json());
app.use(UserRouter);
app.use(TaskRouter);


app.listen(port,()=>{
    console.log("Server is running at port "+port);
})

/*
const User = require('./models/User')
const main = async ()=>{
    /*
    const task = await Task.findById('5fb60418842118681cde9afa');
    await task.populate('owner').execPopulate()
    console.log(task.owner) 
    const user = await User.findById('5fb72499d2cc2c6c5cb50d40');
    await user.populate('tasks').execPopulate();
    console.log(user.tasks) //Name assigned to the virtual
}
main()
*/