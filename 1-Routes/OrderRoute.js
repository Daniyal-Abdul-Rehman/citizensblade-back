const express = require('express');
const auth = require('../2-Controllers/middlewares/auth');
const OrderRoutes=express.Router();

const OrderController=require('../2-Controllers/OrderController');

// 1.get all product

OrderRoutes.get('/all',auth,OrderController.getAll);

// 2.create product

// ProductRoutes.post('/add',productController.createProduct);
// // 3.update product by id 
OrderRoutes.post('/status',auth,OrderController.updateStatus);
// // 4.get product by id 
// ProductRoutes.get('/single/:id',productController.getProductById);
// // 5.delete product by id
OrderRoutes.delete('/delete/:id',auth,OrderController.deleteOrderById);

module.exports=OrderRoutes;