const mongoose=require('mongoose');

const crousalSchema=mongoose.Schema({
    eventname:{type:String,default:''},
    image:{type:String}
},
    {timestamps:true}
)


// creating model of user

const CrousalModel=mongoose.model('crousal',crousalSchema);


module.exports=CrousalModel;