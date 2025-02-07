const express = require('express');

const routes=express.Router();
const favoriteController = require('../2-Controllers/favoriteController');
routes.post('/add',favoriteController.createFavorite);
routes.get('/all',favoriteController.getallFavorite);
routes.get('/single/:id',favoriteController.getFavorite);
routes.get('/fav/:id',favoriteController.getproductFavorite);
module.exports=routes;