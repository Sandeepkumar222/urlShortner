// importing express to use Router function from it
const express = require('express')
const router = express.Router()

// mongo.js, importing to access database
const mongo = require('../shared/mongo')



// importing route services 
const forgotPasswordService = require('../services/forgotPasswordService')

router.post("/emailSending", forgotPasswordService.emailCheck);

router.put("/update/:id",async(req,res) => {
   
    const post = await forgotPasswordService.updatePassword(req.params.id,req.body,res) ;
    
})

// router.post("/login", authService.login);

module.exports = router;
