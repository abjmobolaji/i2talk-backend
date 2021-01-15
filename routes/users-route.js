const express = require('express');

// Required Controllers
const userController = require('../controllers/users-controller');
const stateLocation = require('../middleware/state-location');
const auth = require('../middleware/auth');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

// GET ALL USERS
router.get("/", auth.authenticateUser, [auth.authorizeUser("view_users"), auth.canUser], userController.getUsers); 

// GET USERS BY ID
router.get("/:id", auth.authenticateUser, userController.getUserByID); 

// GET USERS BY ID
router.get("/username/:username", auth.authenticateUser, userController.getUserByUsername); 

// EDIT USER PROFILE
router.put("/editProfile", auth.authenticateUser, fileUpload.single('profile-picture'), stateLocation.getlatlongFromState,  userController.editUserDetails);

// CHANGE USER PASSWORD
router.post("/changePassword", auth.authenticateUser, userController.changePassword);


module.exports = router;