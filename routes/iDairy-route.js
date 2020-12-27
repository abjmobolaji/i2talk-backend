// Required files
const express = require('express');
// const { iDairyValidationRules, validate } = require('../models/validator');

// Required Controller
const iDairyControllers = require('../controllers/iDairy-controller');
const auth = require('../middleware/auth');


const router = express.Router();

router.post('/add', auth.authenticateUser, iDairyControllers.createDairy);

router.put('/edit/:id', auth.authenticateUser, iDairyControllers.editDairy);

router.get('/', auth.authenticateUser, iDairyControllers.getAllDairy);

router.get('/:id', auth.authenticateUser, iDairyControllers.getDairy);

router.get('/search/:id', auth.authenticateUser, iDairyControllers.searchDairy);

router.delete('/delete/:id', auth.authenticateUser, iDairyControllers.deleteDairy);


module.exports = router;