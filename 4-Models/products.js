
const mongoose=require('mongoose');

const productSchema=mongoose.Schema({
    productName :{type:String,required:true},
    price:{type:mongoose.Types.Decimal128,required:true},
    description:{type:String,required:true},
    discount:{type:Number},
    images:[{ type: String }],
    video: { type: String, required: true },
    landingImage:{ type: String, required: true },
},
    {timestamps:true}
)

// creating model of user

const ProductModel=mongoose.model('product',productSchema);

module.exports=ProductModel;