const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const User = mongoose.model('User')
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if (isPhoto) {
      next(null, true)
    } else {
      next({ message: 'That file type is not supported! ' }, false)
    }
  }
}

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next()
    return
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`

  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)
  next()
}

exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'add store'})
}

exports.createStore = async (req, res) => {

  req.body.author = req.user._id

  const store = await (new Store(req.body)).save()

  req.flash('sucess', `Succesfully created ${store.name}!`)
  res.redirect(`/store/${store.slug}`)
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author')
  // 404 if no store
  if (!store) return next()

  res.render('store', { store, title: store.name })
}

exports.getStores = async (req, res) => {
  const stores = await Store.find()
  // render the  stores view and also pass the stores variable
  res.render('stores', { title: 'Stores', stores })
}

exports.getStoresByTag = async (req, res) => {

  const tag = req.params.tag
  const tagQuery = tag || { $exists: true }
  const tagsPromise = Store.getTagList()
  const storesPromise = Store.find({ tags: tagQuery })

  const [tags, stores ] = await Promise.all([
    tagsPromise,
    storesPromise
  ])
  res.render('tags', { tags, title: 'Tags', tag, stores })
}

const confirmOwner = (store, user) => {
  if(!store.author.equals(user._id)) {
    throw Error('You must own this store in order to edit it')
  }
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id })

  confirmOwner(store, req.user)

  res.render('editStore', {
    title: `edit ${store.name}`,
    store })
}

exports.updateStore = async (req, res) => {

  req.body.location.type = 'Point'

  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true
  }).exec()

  req.flash('success', `successfully updated ${store.name} <a href="/stores/${store.slug}">View store</a>`)
  res.redirect(`/stores/${store._id}/edit`)
}

exports.searchStores = async (req, res) => {
  // find the stores
  const stores = await Store.find({
    $text: {
      $search: req.query.q
    }
  },{
    score: { $meta: 'textScore' }
    // sort by textscore
  }).sort({
    score: { $meta: 'textScore' }
    // limit to 'x'
  }).limit(5)

  res.json(stores)
}

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat)
  console.log(coordinates)
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000
      }
    }
  }

  const stores = await Store
    .find(q)
    .select('slug name description location photo')
    .limit(10)

  res.json(stores)
}

exports.mapPage = (req, res) => {
  res.render('map', {title: 'Map'})
}

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map( obj => obj.toString())
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet'
  const user = await User.findOneAndUpdate(
    req.user.id,
    { [operator]: { hearts: req.params.id }},
    { new:  true }
  )
  res.json(user)
}