const express = require('express')
const router = express.Router()
const storeRouter = require('../controllers/storeController')
const { catchErrors } = require('../handlers/errorHandlers')


// Hit this specif route '/' then do something
router.get('/', storeRouter.homePage)
// Hit /add then do something
router.get('/add', storeRouter.addStore)
// Hit /add then do something
router.post('/add', catchErrors(storeRouter.createStore))

module.exports = router
