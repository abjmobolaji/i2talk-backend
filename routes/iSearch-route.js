// Required files
const express = require('express');
const { iSearchValidation1Rules, iSearchValidation2Rules, iSearchValidation3Rules, validate } = require('../models/validator');

// Required Controllers
const iSearchController = require('../controllers/iSearch-controller');
const auth = require('../middleware/auth');

const router = express.Router();

// iSearch by Username
router.post("/username-phone", auth.authenticateUser, iSearchValidation1Rules(), validate, iSearchController.iSearchUserName);

// iSearch by LocationName
router.post("/location", auth.authenticateUser, iSearchValidation2Rules(), validate, iSearchController.iSearchLocationName);

// iSearch by User Geolocation Data
router.post("/geolocation", auth.authenticateUser, iSearchValidation3Rules(), validate, iSearchController.iSearchGeoLocation);

module.exports = router;