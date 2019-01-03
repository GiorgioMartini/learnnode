const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise

const md5 = require('md5')
const validator = require('validator')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
const passportLocalMongoose = require('password-local-mongoose')

// Create our model
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'invalid email Adress'],
    required: 'please supply an email adress',
  },
  name: {
    type: String,
    required: 'please supply a name',
    trim: true,
  }
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })
userSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('Store', storeSchema)
