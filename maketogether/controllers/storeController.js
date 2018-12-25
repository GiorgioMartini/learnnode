const mongoose = require('mongoose')
const Store = mongoose.model('Store')

exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'add store'})
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save()
  await store.save()
  req.flash('sucess', `Succesfully created ${store.name}!`)
  res.redirect(`./store/${store.slug}`)
}

exports.getStores = async (req, res) => {
  const stores = await Store.find()
  console.log(stores)
  // render the  stores view and also pass the stores variable
  res.render('stores', { title: 'Stores', stores })
} 

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id })
  
  res.render('editStore', { 
    title: `edit ${store.name}`,
    store })
}

exports.updateStore = async (req, res) => {
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true
  }).exec()

  req.flash('success', `successfully updated ${store.name} <a href="/stores/${store.slug}">View store</a>`)
  res.redirect(`/stores/${store._id}/edit`)
}
 