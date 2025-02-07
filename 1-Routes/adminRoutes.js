const express = require('express');
const routes=express.Router();
const AdminController = require('../2-Controllers/adminController');
routes.get('/dashboard',AdminController.getDashboard);


module.exports=routes;