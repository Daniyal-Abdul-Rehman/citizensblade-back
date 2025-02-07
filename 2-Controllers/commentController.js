const joi = require("joi");
const Comment =require('../4-Models/comments');
const commentDTO=require('../DTO/Commentdto');
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const commentController = {
    async create(req, res, next){
        const createCommentSchema = joi.object({
            userName: joi.string().required(),
            commentData:joi.string().required(),
            userImage: joi.string().required(),
        });

        const {error} = createCommentSchema.validate(req.body);
        
        if (error){
            console.log(error);
            return next(error);
        }

        const {userName,commentData,userImage} = req.body;

        try{
            const newComment = new Comment({
               userName,commentData,userImage
            });

            await newComment.save();
            return res.status(201).json({message: 'comment created'});
        }
        catch(error){
            return next(error);
        }
    },
    async getComment(req,res,next){
        try {
          const allComment = await Comment.find({});
          const CommentDTOarr = [];
          for (let i = 0; i < allComment.length; i++) {
            const commentdto = new commentDTO(allComment[i]);
            CommentDTOarr.push(commentdto);
          }
          return res.status(200).json({ CommentData:CommentDTOarr });
        } catch (error) {
          return next(error);
        }
      },
    async updatecomment(req,res,next){
        const updateSchema = joi.object({
            id: joi.string().regex(mongodbIdPattern).required(),
            reply: joi.string(),
          });
      
          const { error } = updateSchema.validate(req.body);
          if (error) {
              return next(error);
          }
          const {id,reply} = req.body;
      
          let comment_data;
          
          try {
            comment_data = await Comment.findOneAndUpdate({ _id: id },{reply:reply},{new:true});
            return res.status(200).json({data:comment_data });
          } catch (error) {
            return next(error);
          }
          
    },
    async deleteComment(req,res,next){
        const deleteSchema = joi.object({
          id: joi.string().regex(mongodbIdPattern).required(),
        });
    
        const { error } = deleteSchema.validate(req.params);
        if(error){
          return next(error);
        }
        const { id } = req.params;
        try {
          await Comment.deleteOne({ _id : id });
        } catch (error) {
          return next(error);
        }
    
        return res.status(200).json({ message: "comment deleted" });
    }
}

module.exports=commentController;