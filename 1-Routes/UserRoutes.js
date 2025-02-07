const express = require('express');

const UserRoutes=express.Router();
const authController = require('../2-Controllers/authController');
const productController=require('../2-Controllers/productController');
const auth = require('../2-Controllers/middlewares/auth');
const {upload} =require("../2-Controllers/middlewares/multer")
/// signup ////

UserRoutes.post('/signup',authController.Signup);

//// login ////

UserRoutes.post('/login',authController.Login);

////Logout

UserRoutes.post('/logout',auth,authController.Logout);

//// refresh 

UserRoutes.get('/refresh',authController.Refresh);

//////////// update 
UserRoutes.put("/update",auth,upload.single('image'),authController.updateUser);
UserRoutes.put("/reset",authController.passwordreset);
////getallusers
UserRoutes.get('/all',auth,authController.getUsers);
UserRoutes.delete('/delete/:id',auth,authController.deleteUser);
module.exports=UserRoutes;