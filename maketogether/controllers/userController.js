const mongoose = require('mongoose')
const Store = mongoose.model('Store')

exports.loginForm = (req, res) => {
  res.render('login', {title: 'Login'})
}

exports.registerForm = (req, res) => {
  res.render('register', {title: 'Register'})
}

exports.validateRegister = (req, res, next) => {
  // this helper comes from app.js and helps validate stuff
  req.sanitizeBody('name')
  req.checkBody('name', 'must supply a name').notEmpty()
  req.checkBody('email', 'That email is not valid').isEmail()
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: true,
    gmail_remove_subadress: false,
  })
  req.checkBody('password', 'Password cannot be blank').notEmpty()
  req.checkBody('password-confirm', 'Confirm password cannot be blank').notEmpty()
  req.checkBody('password-confirm', 'Oooop password do not match').equals(req.body.password)

  const errors = req.validationErrors()

  if(errors) {
    req.flash('error', errors.map( err => err.msg))
    res.render('register', {
      title: 'Registser',
      body: req.body,
      flashes: req.flash()
    })
    return
  }
  next()
}

