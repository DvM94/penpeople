const express = require('express')
const rtUsers = express.Router()
const usersController = require('../controllers/usersController')

rtUsers.post('/create', usersController.signup)
rtUsers.post('/validate', usersController.validate)
rtUsers.post('/login', usersController.login)
rtUsers.post('/forgetpassword', usersController.forgetPassword)
rtUsers.post('/newpassword', usersController.newPassword)
rtUsers.post('/login', usersController.login)
rtUsers.post('/list', usersController.list)
rtUsers.post('/like', usersController.like)
rtUsers.post('/findbyid', usersController.findById)
rtUsers.post('/findbynickname', usersController.findByNickname)
rtUsers.post('/edit', usersController.edit)
rtUsers.post('/delete', usersController.delete)

module.exports= rtUsers