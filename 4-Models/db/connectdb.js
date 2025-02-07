///// importing the config file
const mongoose = require("mongoose");
const config=require('../../config/index');
const DATABASE_OPTIONS=config.DATABASE_OPTIONS;
const connectdb = async (Database) => {
  try {
    await mongoose.connect(Database,DATABASE_OPTIONS);
    console.log('database connected');
  } catch (err) {
    console.log(err);
  }
};


module.exports=connectdb;