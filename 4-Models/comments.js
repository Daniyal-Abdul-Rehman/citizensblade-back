const mongoose=require('mongoose');

const commentSchema=mongoose.Schema({
    userName :{type:String,required:true},
    commentData:{type:String},
    reply:{type:String,default:''},
    userImage:{type:String},
},
    {timestamps:true}
)


// creating model of user

const CommentModel=mongoose.model('comment',commentSchema);


module.exports=CommentModel;