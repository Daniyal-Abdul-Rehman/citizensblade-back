const joi = require("joi");
const crouselModel=require("../4-Models/crousal");
const crouselDTO=require("../DTO/Crouseldto");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const BACKEND_SERVER_PATH=process.env.BACKEND_SERVER_PATH
const crouselController = {
    async createcrousel(req,res,next){
            const crouselschema=joi.object({
                eventname:joi.string().min(3).max(15).required(),
                image:joi.string().required(),
            });
            try{
            let url=`${BACKEND_SERVER_PATH}/files/`;
            const url_image=req.file.filename;
            req.body.image=url+url_image;
            const {error}=crouselschema.validate(req.body);
            if (error) {
              console.log(error);
                return next(error);
            }
            const {eventname,image}=req.body;
            const newcrousel=new crouselModel({
                eventname,
                image,
            });
            await newcrousel.save();
            return res.status(200).json({ "message": "Crousel created ...." });
        } catch (error) {
            return next(error); 
        }
    },
    async getCrousel(req,res,next){
      try {
        const allCrousels = await crouselModel.find({});
  
        const CrouselDTOarr = [];
  
        for (let i = 0; i < allCrousels.length; i++) {
          const crouseldto = new crouselDTO(allCrousels[i]);
          CrouselDTOarr.push(crouseldto);
        }
        console.log(CrouselDTOarr)
        return res.status(200).json({ CrouselData:CrouselDTOarr });
      } catch (error) {
        return next(error);
      }
    },
    async deleteCrousel(req,res,next){
        const deleteSchema = joi.object({
          id: joi.string().regex(mongodbIdPattern).required(),
        });
    
        const { error } = deleteSchema.validate(req.params);
        if(error){
          return next(error);
        }
        const { id } = req.params;
        try {
          await crouselModel.deleteOne({ _id : id });
        } catch (error) {
          return next(error);
        }
    
        return res.status(200).json({ message: "Offer deleted" });
    }
}
module.exports=crouselController;