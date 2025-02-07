const joi = require("joi");
const rating = require("../4-Models/rating");
const User = require("../4-Models/user");
const {Order} = require("../4-Models/sales");
const comment=require("../4-Models/comments");
const ProductModel = require("../4-Models/products");
const offers=require("../4-Models/crousal");

const AdminController = {
  async getDashboard(req, res, next) {
    try {
      const products = await ProductModel.countDocuments();
      const user = await User.countDocuments();
      const sale = await Order.countDocuments();
      const Comment = await comment.countDocuments();
      const Offers = await offers.countDocuments();
      const favorite = await rating.countDocuments({ favorite: true });
      const totalsales = await Order.find({ delivery_status: 'Success' });
      const totalAmount = totalsales.reduce((total, order) => {
      return total + order.total;
      }, 0);

      console.log('Total sales where status is "Success":', totalAmount);
      const UserChart = await getUserMap();
      const OrderChart = await getOrderMap();
      console.log(Offers)
      const data = {
        products: products,
        user: user,
        sale: sale,
        totalearn: (totalAmount/100),
        favorite: favorite,
        comments:Comment,
        offer:Offers,
        UserChart,
        OrderChart,
      };

      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

const getUserMap = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  
  try {
    console.log("Thirty days ago:", thirtyDaysAgo);

    const result = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
    ]);

    console.log("After $match:", result);

    const groupStage = {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    };

    const resultAfterGroup = await User.aggregate([groupStage]);
    
    console.log("After $group:", resultAfterGroup);

    const projectStage = {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        count: 1,
      },
    };

    const resultAfterProject = await User.aggregate([groupStage, projectStage]);

    console.log("After $project:", resultAfterProject);

    const sortStage = { $sort: { date: 1 } };

    const finalResult = await User.aggregate([groupStage, projectStage, sortStage]);

    console.log(finalResult);
    return finalResult;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getOrderMap = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          count: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = AdminController;
