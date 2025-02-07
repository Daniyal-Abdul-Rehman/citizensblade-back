
function OrderDTO(orders) {
    this._id = orders._id;
    this.productNames = orders.productNames;
    this.shipping = orders.shipping;
    this.delivery_status = orders.delivery_status;
}
module.exports=OrderDTO;