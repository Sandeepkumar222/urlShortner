const Joi = require('joi')

// schema for register
const register = Joi.object({
    name : Joi.string().min(3).required(),
    email : Joi.string().required().email(),
    password : Joi.string().min(5).required()
})

const login = Joi.object({
    email : Joi.string().required().email(),
    password : Joi.string().min(5).required()
})

const emailSending = Joi.object({
    email : Joi.string().required().email(),
})

const updatePassword = Joi.object({
    password : Joi.string().min(5).required()
})

module.exports = {
    register,
    login,
    emailSending
}
