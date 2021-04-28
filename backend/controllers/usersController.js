const User = require('../models/User')
const mailer = require("../helpers/mailer")
const path = require('path')
const bcrypt = require("bcrypt")

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
        if (error.keyPattern.nickname) errors.repeatnickname = "Este nickname ya está cogido"
        if (error.keyPattern.email) errors.repeatemail = "Este email ya está registrado"
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
    .then(user => res.json(user))
    .catch(() => res.json(null))
}

usersController.login = (req, res) => {
  User.findOne({ email: req.body.email})
    .then(async user => {
      if(user == null) res.json({error:'Usuario no registrado'})
      else if(user.active == false) res.json({error:'Usuario no validado'})
      else {
        let response = await bcrypt.compare(req.body.password, user.password)
        if(response == false) res.json({error:'Contraseña incorrecta'})
        else res.json(user)
      }
    })
}

usersController.forgetPassword = (req,res) => {
  User.findOne({ email: req.body.email})
    .then(user => {
      mailer.send(user, "Cambio de contraseña")
      res.json('ok')
    })
}

usersController.validateEmail = (req,res) => {
  User.findOne({ email: req.body.email})
    .then(user => {
      mailer.send(user, "Activar cuenta")
      res.json('ok')
    })
}

usersController.newPassword = (req,res) => {
  let newUser = new User(req.body)
  if(newUser.validateSync().errors.password==undefined){
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        User.findOneAndUpdate({ _id: req.body._id }, { password: hash }, { runValidators: false })
          .then(() => res.json('ok'))
      })
  }else{
    let errors = { password: newUser.validateSync().errors.password.message }
    res.json(errors)
  }
}

usersController.list = (req, res) => {
  User.find({ nickname: { $regex: `.*${req.body.nickname}.*`, $options: 'i' }, active: true, admin:req.body.admin }, 'likes avatar nickname email').lean()
    .then(users => res.json(users))
}

usersController.like = (req,res) => {
  User.findOne({ nickname: req.body.nickname })
    .then(user => {
      User.findByIdAndUpdate( user._id, { likes: user.likes+1 })
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
  User.findOneAndUpdate({ email: req.body.email }, { firstname: req.body.firstname, lastname: req.body.lastname, nickname: req.body.nickname, bio: req.body.bio, instagram: req.body.instagram, twitter: req.body.twitter, other: req.body.other })
    .then(user => res.json(user))
    .catch(error => {
      let errors = {}
      if (error.code == 11000) errors.repeat = "Nickname no disponible"
      else {
        if (error.errors.firstname) errors.firstname = error.errors.firstname.message
        if (error.errors.lastname) errors.lastname = error.errors.lastname.message
        if (error.errors.nickname) errors.nickname = error.errors.nickname.message
        if (error.errors.bio) errors.bio = error.errors.bio.message
      }
      res.json(errors)
    })
}

usersController.editAvatar = (req, res) => {
  User.findOneAndUpdate({ email: req.body.email }, { avatar: req.body.avatar })
    .then(user => {
      req.files.image.mv(path.join(__dirname,'../..',`/src/assets/img/users/${req.body._id}.jpg`), err => { if (err) console.log( err ) })
      res.json(user)
    })
}

usersController.delete = (req, res) => {
  User.findOneAndRemove({ email: req.body.email })
    .then(() => res.json('ok'))
}

usersController.closeAccount = (req, res) => {
  User.findOneAndUpdate({ email: req.body.email }, { active: false })
    .then(() => res.json('ok'))
}

module.exports = usersController