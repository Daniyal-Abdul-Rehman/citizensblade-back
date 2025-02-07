const express = require('express');
const crouselController=require('../2-Controllers/crouselController');
const CrouselRoutes=express.Router();
const auth = require('../2-Controllers/middlewares/auth');
const {upload} =require("../2-Controllers/middlewares/multer")

CrouselRoutes.post("/add",upload.single('image'),crouselController.createcrousel);
CrouselRoutes.get("/all",crouselController.getCrousel);
CrouselRoutes.delete("/delete/:id",crouselController.deleteCrousel);
module.exports=CrouselRoutes;