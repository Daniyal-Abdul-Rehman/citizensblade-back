const express = require('express');
const commentController=require('../2-Controllers/commentController');
const CommentRoutes=express.Router();
const auth = require('../2-Controllers/middlewares/auth');
CommentRoutes.post("/add",auth,commentController.create);
CommentRoutes.get('/all',commentController.getComment);
CommentRoutes.put('/update',auth,commentController.updatecomment);
CommentRoutes.delete('/delete/:id',auth,commentController.deleteComment);
module.exports=CommentRoutes;