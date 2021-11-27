// importing express to use Router function from it
const express = require('express')
const router = express.Router()

// mongo.js, importing to access database
const mongo = require('../shared/mongo')



// importing route services 
const authService = require('../services/authServices')

router.post("/register", authService.register);

router.post("/login", authService.login);

module.exports = router;