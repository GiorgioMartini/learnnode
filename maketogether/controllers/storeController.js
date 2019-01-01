const mongoose = require('mongoose')
const Store = mongoose.model('Store')
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
  const store = await (new Store(req.body)).save()
  req.flash('sucess', `Succesfully created ${store.name}!`)
  res.redirect(`/store/${store.slug}`)
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug })
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
  const tags = await Store.getTagList()
  const tag = req.params.tag 
  res.render('tags', { tags, title: 'Tags', tag })
}

  exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id })
  
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
 