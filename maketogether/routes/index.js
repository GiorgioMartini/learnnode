const express = require('express')
const router = express.Router()
const storeRouter = require('../controllers/storeController')

// Hit this specif route '/' then do something
router.get('/', storeRouter.homePage)

// Hit /add then do something
router.get('/add', storeRouter.addStore)

module.exports = router
