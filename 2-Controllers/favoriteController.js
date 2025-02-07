const joi = require("joi");
const rating=require("../4-Models/rating");
const favDTO=require('../DTO/ratingdto');
const allfavDTO=require('../DTO/allfavoritedto');
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const favoriteController = {
  async createFavorite(req, res, next) {
    const createfavschema = joi.object({
      favorite: joi.boolean(),
      productId: joi.string().regex(mongodbIdPattern).required(),
      userId: joi.string().regex(mongodbIdPattern).required()
    });
  
    const { error } = createfavschema.validate(req.body);
    if (error) {
      return next(error);
    }
  
    const { favorite, productId, userId } = req.body;
  
    try {
      const existingFavorite = await rating.findOne({ productId, userId });
  
      if (existingFavorite) {
        existingFavorite.favorite = favorite;
        await existingFavorite.save();
        return res.status(201).json({ fav: existingFavorite });
      } else {
        // If it doesn't exist, create a new favorite
        const newFavorite = new rating({
          favorite,
          productId,
          userId,
        });
        await newFavorite.save();
        const favDto = new favDTO(newFavorite);
        return res.status(201).json({ fav: favDto });
      }
    } catch (error) {
      return next(error);
    }
  },  
  async getallFavorite(req, res, next) {
    try {
      console.log("triggered");
      const allFav = await rating.find({ favorite: true }).populate('productId');
      
      if (!allFav || allFav.length === 0) {
        console.log("no no");
        return res.status(200).json({ favData: [], message: "No favorite data available." });
      }
  
      const favoriteCountMap = new Map();
      console.log("triggered");
      for (let i = 0; i < allFav.length; i++) { // Change from <= to <
        const fav = allFav[i];
        const productId = fav.productId._id.toString();
        if (fav.favorite) {
          favoriteCountMap.set(productId, (favoriteCountMap.get(productId) || 0) + 1);
        }
      }
      console.log("triggered");
  
      const FavDTOarr = [];
      console.log("triggered");
      for (let i = 0; i < allFav.length; i++) {
        const favdto = new allfavDTO(allFav[i]);
        const productId = allFav[i].productId._id.toString();
        favdto.favoriteCount = favoriteCountMap.get(productId) || 0;
        FavDTOarr.push(favdto);
      }
      console.log("triggered");
  
      return res.status(200).json({ favData: FavDTOarr });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  },  
  async getFavorite(req, res, next) {
    try {
      const getByIdSchema = joi.object({
        id: joi.string().regex(mongodbIdPattern).required(),
      });
      const { error } = getByIdSchema.validate(req.params);
  
      if (error) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
  
      const { id } = req.params;
      const allFav = await rating.find({ userId: id }); 
      const FavDTOarr = [];
      for (let i = 0; i < allFav.length; i++) {
        const favdto = new favDTO(allFav[i]);
        FavDTOarr.push(favdto);
      }
      return res.status(200).json({ favData: FavDTOarr });
    } catch (error) {
      return next(error);
    }
  },
  async getproductFavorite(req, res, next) {
    try {
      const getByIdSchema = joi.object({
        id: joi.string().regex(mongodbIdPattern).required(),
      });
      const { error } = getByIdSchema.validate(req.params);
      if (error) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
  
      const { id } = req.params;
      const allFav = await rating.countDocuments({ productId: id }); 
      return res.status(200).json({Fav:allFav});
    } catch (error) {
      return next(error);
    }
  }  
  
};

module.exports = favoriteController;