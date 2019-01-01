const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slugs')

// Create our model
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [{
      type: Number,
      required: 'you must add a coordinate',
    }],
    address: {
      type: String,
      required: 'you must add a adress'
    },
  },
  photo: String,
})

storeSchema.pre('save', async function(next) {

  if (!this.isModified('name')) {
    next()
    return
    }
  
  this.slug = slug(this.name)
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  const storeWithSlug = await this.constructor.find({ slug: slugRegEx })

  if ( storeWithSlug.length ) {
    this.slug = `${this.slug}-${storeWithSlug.length + 1}`
  }

  next()
})

module.exports = mongoose.model('Store', storeSchema)
