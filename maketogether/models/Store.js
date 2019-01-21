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
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
},{
  toJSON: {virtual: true},
  toObject: {virtual: true},
})


// define our index
storeSchema.index({
  name: 'text',
  description: 'text'
})

storeSchema.index({
  location: '2dsphere'
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

storeSchema.statics.getTagList = function() {
  return this.aggregate([
    { $unwind: '$tags'},
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])
}

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // lookup stores and populate their reviews
    { $lookup:{
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews'
      }},
    // filter for only elemetns with more than two reviews
    { $match: {
        'reviews.1': { $exists: true } 
      }},
    // add average fields review
    { $addFields: {
        averageRating: { $avg: '$reviews.rating' }
      }},
    // sort by our new field
    { $sort: { averageRating: -1 }},
    // limit
    { $limit: 10 }
  ])
}

function autopopulate(next) {
  this.populate('reviews')
  next()
}

storeSchema.pre('find', autopopulate)
storeSchema.pre('findOne', autopopulate)

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store'
})

module.exports = mongoose.model('Store', storeSchema)
