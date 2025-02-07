
function commentDTO(data){
    this._id=data._id;
    this.userName=data.userName;
    this.commentData=data.commentData;
    this.reply=data.reply;
    this.userImage=data.userImage;
}


module.exports = commentDTO;