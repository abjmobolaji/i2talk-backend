const express = require('express');
const { check } = require('express-validator');

// Required Controllers
const userController = require('../controllers/users-controller');
const stateLocation = require('../middleware/state-location');

const router = express.Router();

router.get("/", userController.getUsers);

router.get("/:id", userController.getUserByID);

router.post("/signup", stateLocation.getlatlongFromState, userController.signup);




module.exports = router;