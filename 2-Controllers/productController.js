const joi = require("joi");
const { BACKEND_SERVER_PATH } = require("../config/index");
const fs = require('fs');
const ProductModel=require('../4-Models/products');
const productDTO=require('../DTO/products');
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const cloudinary = require('cloudinary').v2;


function extractPublicId(url) {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
const productController = {
 
  // for creating the product
  async createProduct(req, res, next) {
    console.log('url')
    try {
    const createproductschema = joi.object({
      productName: joi.string().required(),
      price: joi.number().required(),
      description: joi.string().required(),
      discount: joi.number(),
    });
    const landingImage = req.files.landingImage ? req.files.landingImage[0] : null;
    const video = req.files.video ? req.files.video[0] : null;
    const images = req.files.images || [];
  const { error } = createproductschema.validate(req.body);
    if (error) {
      return next(error);
    }  
    const {productName,price,description, discount} =req.body;
    const fileData = {
      productName:productName, 
      price:price, 
      description:description, 
      discount:discount, 
      landingImage: landingImage ? landingImage.path : null, 
      video: video ? video.path : null,                    
      images: images.map(image => image.path),             
    };

    const newProduct = new ProductModel(fileData);
     const data= await newProduct.save();
     const productDto = new productDTO(newProduct);
     console.log(productDto);
     return res.status(201).json({ product: productDto });
    } catch (error) {
      console.log(error)
      return next(error);
    }
  },
  // for updating product
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
  
      // Fetch existing product
      const product = await ProductModel.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
  
      const updatedData = {};
      const { productName, price, description, discount } = req.body;
  
      // Update fields conditionally
      if (productName) updatedData.productName = productName;
      if (price) updatedData.price = price;
      if (description) updatedData.description = description;
      if (typeof discount !== 'undefined') updatedData.discount = discount;
  
      // Handle landing image upload
      if (req.file) { // Check if new file is uploaded
        // Delete existing landing image if it exists
        if (product.landingImage) {
          const publicId = extractPublicId(product.landingImage);
          await cloudinary.uploader.destroy(publicId);
        }
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        updatedData.landingImage = uploadResult.secure_url; // Update with new URL
      } else {
        updatedData.landingImage = product.landingImage; // Keep existing if not changed
      }
  
      // Handle video upload similarly
      if (req.files.video) { // Assuming video can be uploaded
        if (product.video) {
          const publicId = extractPublicId(product.video);
          await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
        const uploadResult = await cloudinary.uploader.upload(req.files.video[0].path, { resource_type: 'video' });
        updatedData.video = uploadResult.secure_url; // Update with new URL
      } else {
        updatedData.video = product.video; // Keep existing
      }
  
      // Handle images
      const images = req.files.images || [];
      if (images.length > 0) {
        // Handle new images: delete existing and upload new ones
        if (product.images) {
          product.images.forEach(imageUrl => {
            const publicId = extractPublicId(imageUrl);
            cloudinary.uploader.destroy(publicId);
          });
        }
        const uploadPromises = images.map(image => cloudinary.uploader.upload(image.path));
        updatedData.images = await Promise.all(uploadPromises);
      } else {
        updatedData.images = product.images; // Keep existing if not changed
      }
  
      // Update the product in the database
      const updatedProduct = await ProductModel.findByIdAndUpdate(id, updatedData, { new: true });
      return res.status(200).json({ product: updatedProduct });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  },
  // for getting all product
  async getAll(req, res, next) {
        try {
                const allProduct = await ProductModel.find({});
          
                const productDTOarr = [];
          
                for (let i = 0; i < allProduct.length; i++) {
                  const productdto = new productDTO(allProduct[i]);
                  productDTOarr.push(productdto);
                }
                console.log(productDTOarr);
                return res.status(200).json({ products: productDTOarr });
              } catch (error) {
                return next(error);
              }
  },
  // for getting product using id
  async getProductById(req, res, next) {
        
    const getByIdSchema = joi.object({
        id: joi.string().regex(mongodbIdPattern).required(),
      });
  
      const { error } = getByIdSchema.validate(req.params);
  
      if (error) {
        return next(error);
      }
  
      let productbyid;
  
      const { id } = req.params;
  
      try {
        productbyid = await ProductModel.findOne({ _id: id });
        if(productbyid._id ==null){
            return next(error);
        }
      } catch (error) {
        return next(error);
      }
  
      const productdto = new productDTO(productbyid);
      return res.status(200).json({ product: productdto });
  },
  // for deleting the produ
  async deleteProductById(req, res, next) {
    const deleteSchema = joi.object({
      id: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // MongoDB ObjectId validation
    });

    const { error } = deleteSchema.validate(req.params);
    if (error) {
      return next(error);
    }

    const { id } = req.params;

    try {
      // Find the product by ID
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Delete images and videos from Cloudinary
      const promises = [];

      // Extract and delete landing image
      if (product.landingImage) {
        const landingImagePublicId = extractPublicId(product.landingImage);
        if (landingImagePublicId) {
          promises.push(
            cloudinary.uploader.destroy(landingImagePublicId, (error, result) => {
              if (error) {
                console.error('Error deleting landing image:', error);
              } else {
                console.log('Landing image deleted:', result);
              }
            })
          );
        }
      }

      // Extract and delete video
      if (product.video) {
        const videoPublicId = extractPublicId(product.video);
        if (videoPublicId) {
          promises.push(
            cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' }, (error, result) => {
              if (error) {
                console.error('Error deleting video:', error);
              } else {
                console.log('Video deleted:', result);
              }
            })
          );
        }
      }

      // Extract and delete additional images
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((imageUrl) => {
          const imagePublicId = extractPublicId(imageUrl);
          if (imagePublicId) {
            promises.push(
              cloudinary.uploader.destroy(imagePublicId, (error, result) => {
                if (error) {
                  console.error('Error deleting image:', error);
                } else {
                  console.log('Image deleted:', result);
                }
              })
            );
          }
        });
      }

      // Wait for all delete operations to finish
      await Promise.all(promises);

      // Now, delete the product from the database
      await ProductModel.deleteOne({ _id: id });

      return res.status(200).json({ message: 'Product and associated Cloudinary media deleted' });

    } catch (error) {
      console.error('Error deleting product:', error);
      return next(error);
    }
  },

};

module.exports = productController;