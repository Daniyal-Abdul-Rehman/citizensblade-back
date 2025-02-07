const User = require("../4-Models/user");

module.exports.addService = async (body) => {
 
 try{
  const user = new User({
  ...body
  });
  user.user_id = user._id
  const userData = await user.save();
  return userData
 }catch(error){
 console.log(error)
 return false
 }

};
module.exports.findService = async (body) => {
 
  try {
    const user_data = await User.find({
    user_id:body.user_id
    
    }).exec();


    return user_data
  } catch (error) {
    console.log(error);
    return false
  }



};

module.exports.updateService = async (body) => {

  try{
   return await User.updateOne({
    user_id: body.user_id
  }, {
    password: password
  }).exec();
  }catch(error){
  console.log(error)
  return false
  }
 
};
module.exports.deleteService = async () => {
try{
  return await User.deleteOne({user_id:body.user_id})
}catch(error){
console.log(error)
return false
}
 
};