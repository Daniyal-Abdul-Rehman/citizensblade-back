function allfavDTO(rating){
    this._id = rating._id;
    this.productImage=rating.productId.landingImage;
    this.productName=rating.productId.productName;
}


module.exports = allfavDTO;