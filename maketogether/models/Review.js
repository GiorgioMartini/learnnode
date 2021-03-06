const mongoose = require('mongoose')
mongoose.Promise = global.Promise

// Create the review model
const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now()
  }, 
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'you must supply an author'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'you must supply a store',
  },
  text: {
    type: String, 
    required: 'you must supply description',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
})

function autopopulate(next) {
  this.populate('author')
  next()
}

reviewSchema.pre('find', autopopulate) 
reviewSchema.pre('findOne', autopopulate) 

module.exports = mongoose.model('Review', reviewSchema)
