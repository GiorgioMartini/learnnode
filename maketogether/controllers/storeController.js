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
