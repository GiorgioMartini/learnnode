const express = require('express')
const router = express.Router()
const storeRouter = require('../controllers/storeController')

// Hit this specif route '/' then do something
router.get('/', storeRouter.homePage)

module.exports = router
