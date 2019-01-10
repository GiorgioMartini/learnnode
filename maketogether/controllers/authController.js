const passport = require('passport')
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const promisify = require('es6-promisify')

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login!',
  successRedirect: '/',
  successFlash: 'You are now logged in'
})

exports.logout = (req, res) => {
req.logout()
req.flash('success', 'you are now logged out')
res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    next()
    return
  }
  req.flash('Error', 'Ooops you must be logged in to do that')
  res.redirect('/login')
}

exports.forgot = async (req, res) => {
// see if a user exists with that email
const user =  await User.findOne({ email: req.body.email })
if(!user){
  req.flash('error', 'No account registered with that email!')
  return res.redirect('/login')
}

// set reset tokens and expiri on their accounts
user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
user.resetPasswordExpires = Date.now() + 36000000 // one hour from now
await user.save()

// send them an email with the token
const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}` 
req.flash('succes', `you have been email a password reset link: http://${req.headers.host}/account/reset/${user.resetPasswordToken}`)

// redirect to login page
res.redirect('/login')
}

exports.confirmedPasswords = (req, res, next) => {
 if(req.body.password === req.body['password-confirm']){
  next()
  return
 }
 req.flash('error', 'passwords do not match')
 res.redirect('back')
}  

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now()}
  })

  if(!user){
    req.flash('error', 'Token expired or not existing')
    return res.redirect('/login')
  }

  res.render('reset', { title: 'Reset your password'})
}

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now()}
  })

  if(!user){
    req.flash('error', 'Token expired or not existing')
    return res.redirect('/login')
  }
  
  const setPassword = promisify(user.setPassword, user)
  await setPassword(req.body.password)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined

  const updatedUser = await user.save()
  await req.login(updatedUser)
  req.flash('succes', 'you succesfully reset your password!')
  res.redirect('/')
}