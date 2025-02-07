const joi = require("joi");
const { Order } = require('../4-Models/sales');
const ProductModel = require('../4-Models/products');
const OrderDTO = require('../DTO/orderdto');
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const OrderController = {
  async getAll(req, res, next) {
    try {
      const allOrder = await Order.find({});

      const OrderDTOarr = [];

      for (let i = 0; i < allOrder.length; i++) {
        const order = allOrder[i];
        const productsData = order.products.map(product => ({
          productId: product.productId,
          quantity: product.quantity
        }));
        
        const productNames = [];
        for (let j = 0; j < productsData.length; j++) {
          const { productId, quantity } = productsData[j];
          try {
            const product = await ProductModel.findById(productId);
            if (product) {
              productNames.push({ productName: product.productName, quantity });
            } else {
              console.log(`Product not found for id: ${productId}`);
            }
          } catch (error) {
            console.error(`Error fetching product with id ${productId}: ${error.message}`);
          }
        }

        const orders = {
          _id: order._id,
          productNames:productNames,
          shipping: order.shipping,
          delivery_status: order.delivery_status,
          email: order.email,
          phone: order.phone,
        };

        const orderDTO = new OrderDTO(orders);

        OrderDTOarr.push(orderDTO);
      }
      console.log(OrderDTOarr)
      return res.status(200).json({ Orders: OrderDTOarr });
    } catch (error) {
      return next(error);
    }
  },
  async updateStatus(req, res, next) {
    const getByIdSchema = joi.object({
        id: joi.string().regex(mongodbIdPattern).required(),
        delivery:joi.string().required(),
      });
      console.log(req.body);
      const { error } = getByIdSchema.validate(req.body);
  
      if (error) {
        return next(error);
      }
  
      let Orderbyid;
  
      const { id,delivery } = req.body;
  
      try {
        Orderbyid = await Order.findOneAndUpdate({ _id: id,delivery_status:delivery});
        if(Orderbyid._id ==null){
            return next(error);
        }
      } catch (error) {
        return next(error);
      }
  
      const orderdto = new OrderDTO(Orderbyid);
      return res.status(200).json({ Order: orderdto });
  },
  async deleteOrderById(req, res, next) {
    const deleteSchema = joi.object({
      id: joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = deleteSchema.validate(req.params);
    if(error){
      return next(error);
    }
    const { id } = req.params;
    try {
      await Order.deleteOne({ _id : id });
    } catch (error) {
      return next(error);
    }

    return res.status(200).json({ message: "Order deleted" });
  },

};

module.exports = OrderController;
