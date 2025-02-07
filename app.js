const express=require('express');
const errorHandler = require('./2-Controllers/middlewares/errorHandler');
const app=express();
const bodyparser =require("body-parser")
const config=require('./config/index');
const connectdb=require('./4-Models/db/connectdb');
const cookieParser = require('cookie-parser');
app.use(bodyparser.json())
const port =config.PORT;
const host=config.HOST;
const DataBase=config.DATABASE_URL;
const UserRoutes = require('./1-Routes/UserRoutes');
const ProductRoutes = require('./1-Routes/ProductRoutes');
const CrouselRoutes=require("./1-Routes/crouselRoutes");
const CommentRoutes=require('./1-Routes/commentRoutes');
const OrderRoutes=require('./1-Routes/OrderRoute');
const FavRoutes=require('./1-Routes/favorite');
const AdminRoutes=require('./1-Routes/adminRoutes');
const stripe = require('./1-Routes/stripe');
const cors=require('cors');
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(express.static(__dirname + "/public/files"));
app.use(express.static("public"));
connectdb(DataBase);
app.use(express.json());
app.use("/user",UserRoutes);
app.use("/product",ProductRoutes);
app.use("/crousel",CrouselRoutes);
app.use("/comment",CommentRoutes);
app.use("/rating",FavRoutes);
app.use("/admin",AdminRoutes);
app.use("/order",OrderRoutes);
app.use("/stripe", stripe);
app.use(errorHandler);
app.get("/",(req,res)=>{
    res.send("hello world");
})
app.listen(port,host,()=>{
    console.log(`http://${host}:${port}`);
})

