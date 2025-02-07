const express = require('express');

const ProductRoutes=express.Router();

const productController=require('../2-Controllers/productController');
const auth = require('../2-Controllers/middlewares/auth');
const upload =require("../2-Controllers/middlewares/multerFileHndler")

// 1.get all product

ProductRoutes.get('/all',productController.getAll);

// 2.create product

ProductRoutes.post('/add',upload.fields([
    { name: 'landingImage', maxCount: 1 },  // Upload one landing image
    { name: 'video', maxCount: 1 },         // Upload one video
    { name: 'images', maxCount: 20 },       // Upload multiple images (up to 20)
  ]),productController.createProduct);
// 3.update product by id 
ProductRoutes.put('/update/:id',upload.fields([
    { name: 'landingImage', maxCount: 1 },  // Upload one landing image
    { name: 'video', maxCount: 1 },         // Upload one video
    { name: 'images', maxCount: 20 },       // Upload multiple images (up to 20)
  ]),productController.updateProduct);
// 4.get product by id 
ProductRoutes.get('/single/:id',productController.getProductById);
// 5.delete product by id
ProductRoutes.delete('/delete/:id',auth,productController.deleteProductById);

module.exports=ProductRoutes;