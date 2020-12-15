const express = require('express');
const { check } = require('express-validator');

// Required Controllers
const userController = require('../controllers/users-controller');
const stateLocation = require('../middleware/state-location');
const auth = require('../middleware/auth');

const router = express.Router();

// GET ALL USERS
router.get("/", auth.authenticateUser, [auth.authorizeUser("view_users"), auth.canUser], userController.getUsers); 

// GET USERS BY ID
router.get("/:id", auth.authenticateUser, userController.getUserByID); 

// EDIT USER PROFILE
router.put("/editProfile/:id",  auth.authenticateUser, userController.editUserDetails);

// CHANGE USER PASSWORD
router.post("/changePassword", auth.authenticateUser, userController.changePassword);


module.exports = router;