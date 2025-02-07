
function productDTO(product){
    console.log("Product Object:", product);
        this._id = product._id;
        this.productName = product.productName;
        this.price = product.price;
        this.description = product.description;
        this.discount=product.discount;
        this.images=product.images;
        this.video=product.video;
        this.landingImage=product.landingImage;
    }


module.exports = productDTO;