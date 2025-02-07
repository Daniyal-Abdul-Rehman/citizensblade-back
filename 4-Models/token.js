const mongoose = require('mongoose');

const {Schema} = mongoose;

const refreshTokenSchema = Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.SchemaTypes.ObjectId, ref: 'user'}
},
{timestamps: true}

);

const RefreshToken= mongoose.model('refreshtoken', refreshTokenSchema);

module.exports=RefreshToken;