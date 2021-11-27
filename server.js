//importing express
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const shortId = require('shortid')
const { ObjectId } = require("mongodb");

//views
app.set('view engine', 'ejs') 


// Middelwares
    app.use(express.urlencoded({ extended : false}))
    app.use(express.json());


//importing environmental configuration
require("dotenv").config();

     //No access error 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//cors
const cors = require("cors");

const corsOptions ={
   origin:'*', 
   optionSuccessStatus:200,
}

//importing JWT to check token
const jwt = require("jsonwebtoken");

app.get("", (req, res) =>{
  res.render("index");
})

app.get("/register", (req, res) =>{
  res.render("register");
})

app.get("/urlTable", (req, res) =>{
  res.render("urlTable");
})

//importing Routes
const userRoute = require("./routes/usersRoute");
const authRoute = require("./routes/authRoute");
const forgotPasswordRoute = require("./routes/forgotPasswordRoute")

//importing mongo
const mongo = require("./shared/mongo");

async function AppServer() {
  try {
    //connecting to mongo
    await mongo.connect();

     
    //cors
   app.options('*', cors());

   //To delete link
   app.get("/deleteLink/:token",async(req,res) => {
    const token = req.params.token;
    console.log(token,req.query.delete, "deleting")
 try {
   if (typeof token !== "undefined") {
     const userInfo = await jwt.verify(token, process.env.TOKEN_SECRET);
    await mongo.db.collection("urlShortnerlinks").deleteOne( {"links.shortUrl": req.query.delete,"links.userid" : userInfo.userid});
    await res.redirect(`/postUrl/${token}?fullUrl=refresh`)
    }
  }catch(err){
    console.log(err)
    res.send("Already deleted or server error go back to page")
  }
})
     
     
    //links redirect for shortURL
    app.get("/add/:shortUrl/:userid",async(req, res, next) => {
      console.log(req.params.shortUrl)
    mongo.db
      .collection("urlShortnerlinks")
      .findOneAndUpdate(
        {"links.shortUrl": req.params.shortUrl,"links.userid" : req.params.userid}, 
        {"$inc" : {"links.clicks": 1}}
        )

        let link = await mongo.db.collection("urlShortnerlinks").findOne({
          "links.userid" : req.params.userid,
          "links.shortUrl" : req.params.shortUrl
        }
        )
        console.log(link)
          res.redirect(link.links.fullUrl);
       
    });

    app.use((req, res, next) => {
      console.log("Allowed");
      next();
    });

    //Routes
    app.use("/forgotPassword", forgotPasswordRoute);
    app.use("/auth", authRoute);

    //Checking token
       app.use("/postURL/:token",async(req, res, next) => {
         console.log(req.query);
      const token = req.params.token;
         console.log(token)
      try {
        if (typeof token !== "undefined") {
          console.log("123");
          console.log("yes entered")
          const userInfo = jwt.verify(token, process.env.TOKEN_SECRET);
          console.log("verifoed")
          if(req.query.fullUrl != "refresh") {
          let data = {links : {
            userid : userInfo.userid,
            fullUrl : req.query.fullUrl,
            shortUrl : shortId.generate(),
            clicks : 0
          }}
       await mongo.db
            .collection("urlShortnerlinks")
            .insertOne(
              { links: data.links },
            )
          }
          let links = await mongo.db.collection("urlShortnerlinks").find({'links.userid' : userInfo.userid}).toArray();
          let totalInfo = await {token ,userInfo,links}
          await res.render("urlTable",{totalInfo})
          // return res.send("success")
        }
      } catch (error) {
        console.log(error);
        res.status(401).send("invalid token");
      }

      res.send("token is missing");
    });


    // app.use("/users", userRoute);

    //Starting App
    app.listen(process.env.PORT, () => {
      console.log("server app is running...");
    });
  } catch (err) {
    console.log(err);
    process.exit();
  }
}
AppServer();
