function ratingDTO(rating){
    this._id = rating._id;
    this.favorite=rating.favorite;
    this.userId=rating.userId._id;
    this.productId=rating.productId._id;
}


module.exports = ratingDTO;