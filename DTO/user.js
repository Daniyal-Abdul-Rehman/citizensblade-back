function UserDTO(user) {
    this._id = user._id;
    this.userName = user.userName;
    this.userEmail = user.userEmail;
    this.Status=user.Status;
    this.userPassword=user.userPassword;
    this.userImage=user.userImage;
}
  
module.exports = UserDTO;
  