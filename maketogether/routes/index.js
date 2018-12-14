const express = require('express')
const router = express.Router()
const storeRouter = require('../controllers/storeController')
const { catchErrors } = require('../handlers/errorHandlers')


// Hit this specif route '/' then do something
router.get('/', storeRouter.getStores)
// Hit this specif route '/stores' then do something
router.get('/stores', storeRouter.getStores)
// Hit /add then do something
router.get('/add', storeRouter.addStore)
// Hit /add then do something
router.post('/add', catchErrors(storeRouter.createStore))

module.exports = router
