const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
});



/* const user_1 = new User({name:"Abhishek    ",email:"ram@gm.com  ",age:"22",password:"Password"}); 
user_1.save().then(()=>console.log(user_1)).catch(error=>console.log(error));
const task_1 = new Task({description:"Learn React"})
task_1.save().then(()=>console.log("inserted")).catch(error=>console.log(error)); */