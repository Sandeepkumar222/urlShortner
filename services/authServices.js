const express = require("express");

const mongo = require("../shared/mongo");
const { ObjectId } = require("mongodb");
// importing jwt to genetrate token
const jwt = require("jsonwebtoken");

//importing for password encrption
const bcrypt = require("bcrypt");

// importing for validating the registering data
//schema for register and login
const schema = require("../shared/schema");

// schema options
const options = {
  abortEarly: false, // include all errors
  allowUnknown: true, // ignore unknown props
  stripUnknown: true, // remove unknown props
};

const service = {
  async login(req, res) {
    const data = req.body;
    console.log(data);
    try {
      //initializig the schema
      const { error } = schema.login.validate(data, options);
      if (error) {
        let alert1 = { error: error.details[0].message };
        console.log(alert1);
        res.render("index", {
          alert1,
        });
        return res.status(400).send({ error: error.details[0].message });
      }
      //check for email
      const user = await service.findEmail(data.email);
      if (!user) {
        let alert1 = { error: "User or password is incorrect" };
        res.render("index", {
          alert1,
        });
        return res.status(400).send({ error: "User or password is incorrect" });
      }
      //check for password
      const isValid = await bcrypt.compare(data.password, user.password);
      if (!isValid) {
        let alert1 = { error: "User or password is incorrect" };
        res.render("index", {
          alert1,
        });
        return res.status(400).send({ error: "User or password is incorrect" });
      }
      //Generating token and sending token as response
      let token = "";
      token = jwt.sign(
        { userid: user._id, email: user.email },
        process.env.TOKEN_SECRET,
        { expiresIn: "8h" }
      );
      const userInfo =  jwt.verify(token, process.env.TOKEN_SECRET);
      
        
       let links = await mongo.db.collection("urlShortnerlinks").find({'links.userid' : userInfo.userid}).toArray();
          let totalInfo = { token, userInfo, links };
          res.render(`urlTable`, {
            totalInfo,
          });
          
    
      

      // return await res.send({ token });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  async register(req, res) {
    const data = req.body;
    try {
      //Confirming password
      if (data.password !== data.password1) {
        let alert1 = { error: "Re-entered password is not same" };
        res.render("register", {
          alert1,
        });
        return res
          .status(400)
          .send({ error: "Re-entered password is not same" });
      }

      //initializig the schema
      const { error } = schema.register.validate(data, options);
      if (error) {
        let alert1 = { error: error.details[0].message };
        res.render("register", {
          alert1,
        });
        return res.status(400).send({ error: error.details[0].message });
      }
      // checking for email existance
      const user = await service.findEmail(data.email);
      if (user) {
        let alert1 = { error: "User already exists" };
        res.render("register", {
          alert1,
        });
        return res.status(400).send({ error: "User already exists" });
      }
      //Password encrption
      const salt = await bcrypt.genSalt(5);
      data.password = await bcrypt.hash(data.password, salt);

      await mongo.db.collection("urlShortnerUsers").insert(data);

      res.render("register", {
        alert1: { error: "Account created" },
      });

      res.send("Account created");
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  findEmail(mail) {
    console.log(mail);
    return mongo.db.collection("urlShortnerUsers").findOne({ email: mail });
  },
};

module.exports = service;
