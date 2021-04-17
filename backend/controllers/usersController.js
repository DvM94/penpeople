const User = require('../models/User')
const mailer = require("../modules/mailer")

const usersController = {}

usersController.signup = (req, res) => {
  let newUser = new User(req.body)
  newUser.save()
    .then(user => {
      mailer.send(user, "Registro usuario nuevo")
      res.json('ok')
    })
    .catch(error => {
      let errors = {}
      if (error.code == 11000) {
        if (error.keyPattern.nickname) errors.repeat = "Este nickname ya está cogido"
        if (error.keyPattern.email) errors.repeat = "Este email ya está registrado"
      }
      else {
        if (error.errors.firstname) errors.firstname = error.errors.firstname.message
        if (error.errors.lastname) errors.lastname = error.errors.lastname.message
        if (error.errors.nickname) errors.nickname = error.errors.nickname.message
        if (error.errors.email) errors.email = error.errors.email.message
        if (error.errors.password) errors.password = error.errors.password.message
      }
      res.json(errors)
    })
}

usersController.validate = (req, res) => {
  User.findByIdAndUpdate(req.body, { active: true })
    .then(() => res.json('ok'))
    .catch(() => res.json(null))
}

usersController.login = (req, res) => {
  User.findOne({ email: req.body.email})
    .then(user => {
      if(user == null) res.json({error:'Usuario no registrado'})
      else if(user.active == false) res.json({error:'Usuario no validado'})
      else if(user.password != req.body.password) res.json({error:'Contraseña incorrecta'})
      else res.json(user)
    })
}

usersController.forgetPassword = (req,res) => {
  User.findOne({ email: req.body.email})
    .then(user => {
      mailer.send(user, "Cambio de contraseña")
      res.json('ok')
    })
}

usersController.newPassword = (req,res) => {
  User.findByIdAndUpdate( req.body._id , { password: req.body.password })
    .then(() => res.json('ok'))
    .catch(error => {
      let errors = { password: error.errors.password.message }
      res.json(errors)
    })
}

usersController.list = (req, res) => {
  User.find({ nickname: { $regex: `.*${req.body.nickname}.*`, $options: 'i' }, active: true, admin:req.body.admin }, 'likes avatar nickname email').lean()
    .then(users => res.json(users))
}

usersController.like = (req,res) => {
  User.findOne({ nickname: req.body.nickname })
    .then(user => {
      User.findOneAndUpdate(req.body.nickname, { likes: user.likes+1 })
      .then(() => res.json('ok'))
    })
}

usersController.findById = (req, res) => {
  User.findById(req.body)
    .then(user => res.json(user))
    .catch(() => res.json(null))
}

usersController.findByNickname = (req, res) => {
  User.findOne({ nickname: req.body.nickname })
    .then(user => res.json(user))
    .catch(() => res.json(null))
}

usersController.edit = (req, res) => {
  User.findOneAndUpdate({ email: req.body.email }, { firstname: req.body.firstname, lastname: req.body.lastname, nickname: req.body.nickname, avatar: req.body.avatar, bio: req.body.bio, instagram: req.body.instagram, twitter: req.body.twitter, other: req.body.other })
    .then(user => res.json(user))
    .catch(error => {
      let errors = {}
      if (error.code == 11000) errors.repeat = "Este nickname ya está cogido"
      else {
        if (error.errors.firstname) errors.firstname = error.errors.firstname.message
        if (error.errors.lastname) errors.lastname = error.errors.lastname.message
        if (error.errors.nickname) errors.nickname = error.errors.nickname.message
        if (error.errors.bio) errors.bio = error.errors.bio.message
      }
      res.json(errors)
    })
}

usersController.delete = (req, res) => {
  User.findOneAndRemove({ email: req.body.email })
    .then(() => res.json('ok'))
}

module.exports = usersController