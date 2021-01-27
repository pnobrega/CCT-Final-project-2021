const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const serviceController = require('./controllers/serviceController')

// user routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

router.get('/profile/:username', userController.ifUserExists, userController.profileServicesScreen)

// services routes
router.get('/create-service', userController.mustBeLoggedIn, serviceController.viewCreateScreen)
router.post('/create-service', userController.mustBeLoggedIn, serviceController.create)
router.get('/service/:id', userController.mustBeLoggedIn, serviceController.viewSingle)
router.get('/service/:id/edit', userController.mustBeLoggedIn, serviceController.viewEditScreen)
router.post('/service/:id/edit', userController.mustBeLoggedIn, serviceController.edit)

module.exports = router