const joi = require("joi");
const bcrypt = require("bcrypt");
const UserModel = require("../4-Models/user");
const userDTO = require("../DTO/user");
const RefreshToken = require("../4-Models/token");
const jwtservices = require("../3-Services/jwtservice");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const BACKEND_SERVER_PATH=process.env.BACKEND_SERVER_PATH
const authController = {
  async Signup(req, res, next) {
    const SignupSchema = joi.object({
      userName: joi.string().min(3).max(15).required(),
      userEmail: joi.string().email().required(),
      userPassword: joi.string().required(),
      Confirm_Password: joi.ref("userPassword"),
    });

    const { error } = SignupSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { userName, userEmail, userPassword } = req.body;

    try {
      const EmailInUse = await UserModel.exists({ userEmail });
      const UserInuse = await UserModel.exists({ userName });
      if (EmailInUse) {
        const error = {
          status: 409,
          message: "Email already registered, use another Email",
        };
        return next(error);
      }
      if (UserInuse) {
        const error = {
          status: 409,
          message: "User Name already registered, use another Name",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    //// hashing password
    const Hashpassword = await bcrypt.hash(userPassword, 10);
    let accessToken;
    let refreshToken;
    let user;
    try {
      /// saving the data
      const SignupUser = new UserModel({
        userName,
        userEmail,
        userPassword: Hashpassword,
      });
      /// save user
      user = await SignupUser.save();
      /// tokens
      accessToken = jwtservices.signAccessToken({ _id: user._id }, "30m");
      refreshToken = jwtservices.signRefreshToken({ _id: user._id }, "60m");
    } catch (error) {
      return next(error);
    }

    await jwtservices.storeRefreshToken(refreshToken, user._id);

    // send tokens in cookie
    
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    const user_DTO = new userDTO(user);
    return res.status(201).json({ user: user_DTO, auth: true });
  },
  ///// Login controller
  async Login(req, res, next) {
    const userLogin = joi.object({
      userEmail: joi.string().email().required(),
      userPassword: joi.string().required(),
    });

    const { error } = userLogin.validate(req.body);

    if (error) {
      return next(error);
    }

    const { userEmail, userPassword } = req.body;

    let user;

    try {
      user = await UserModel.findOne({ userEmail });

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid user email",
        };

        return next(error);
      }
      const match = await bcrypt.compare(userPassword, user.userPassword);

      if (!match) {
        const error = {
          status: 401,
          message: "Invalid password",
        };

        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    const accessToken = jwtservices.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = jwtservices.signRefreshToken({ _id: user._id }, "60m");

    // update refresh token in database
    try {
      await RefreshToken.updateOne(
        {
          _id: user._id,
        },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly:true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly:true,
    });
    const user_DTO = new userDTO(user);
    return res.status(200).json({ user: user_DTO, auth: true });
  },
  ////Logout
  async Logout(req, res, next) {
    const { refreshToken } = req.cookies;
    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }
    // delete cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // 2. response
    res.status(200).json({ user: null, auth: false });
  },
  /////update set
  async updateUser(req,res,next){
   const updateschema=joi.object({
    id: joi.string().regex(mongodbIdPattern).required(),
    userName: joi.string().min(3).max(15).required(),
    userEmail: joi.string().email().required(),
    userImage:joi.string(),
   });
   try{
    let url=`${BACKEND_SERVER_PATH}/files/`;
    const url_image=req.file.filename;
    req.body.userImage=url+url_image;
    const {error}=updateschema.validate(req.body);
    if (error) {
        return next(error);
    }
    const {id,userName,userEmail,userImage}=req.body;
    let user_data;
    
    user_data = await UserModel.findOneAndUpdate({ _id: id },{userName:userName,userEmail:userEmail,userImage:userImage},{new:true});
    return res.status(200).json({message:'updated successfully'});
    } catch (error) {
      return next(error);
    }
  },
  async passwordreset(req,res,next){
    const Resetschema=joi.object({
      userEmail: joi.string().email().required(),
      userPassword: joi.string().required(),
      Confirm_Password: joi.ref("userPassword"),
     });
     const { error } = Resetschema.validate(req.body);
     if (error) {
        return next(error);
    }
     const {userEmail,userPassword} = req.body;
     let user_data;
     const Hashpassword = await bcrypt.hash(userPassword, 10);
     try {
       user_data = await UserModel.findOneAndUpdate({ userEmail: userEmail },{userPassword:Hashpassword});
       return res.status(200).json({auth:true});
     } catch (error) {
       return next(error);
     }
     

  },
  //////refresh
  async Refresh(req, res, next) {
    
    const originalRefreshToken = req.cookies.refreshToken;

    let id;

    try {
      id = jwtservices.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }

    try {
      const match = RefreshToken.findOne({
        _id: id,
        token: originalRefreshToken,
      });

      if (!match) {
        const error = {
          status: 401,
          message: "Unauthorized",
        };

        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    try {
      const accessToken = jwtservices.signAccessToken({ _id: id }, "30m");

      const refreshToken = jwtservices.signRefreshToken({ _id: id }, "60m");

      await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (error) {
      return next(error);
    }

    const user = await UserModel.findOne({ _id: id });

    const userDto = new userDTO(user);

    return res.status(200).json({ user: userDto, auth: true });
  },
  async getUsers(req,res,next){
    try {
      const allUsers = await UserModel.find({});
      const UserDTOarr = [];
      for (let i = 0; i < allUsers.length; i++) {
        const userdto = new userDTO(allUsers[i]);
        UserDTOarr.push(userdto);
      }
      console.log(allUsers)
      return res.status(200).json({ UserData:UserDTOarr });
    } catch (error) {
      return next(error);
    }
  },
  async deleteUser(req,res,next){
    const deleteSchema = joi.object({
      id: joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = deleteSchema.validate(req.params);
    
    const { id } = req.params;
    try {
      await UserModel.deleteOne({ _id : id });
    } catch (error) {
      return next(error);
    }

    return res.status(200).json({ message: "user deleted" });
}

};
module.exports = authController;

