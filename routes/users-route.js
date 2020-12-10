const express = require('express');
const { check } = require('express-validator');

// Required Controllers
const userController = require('../controllers/users-controller');
const stateLocation = require('../middleware/state-location');
const auth = require('../middleware/auth');

const router = express.Router();

// GET ALL USERS
router.get("/", auth.authenticateUser, auth.authorizeUser("view_users"), userController.getUsers);

// GET USERS BY ID
router.get("/:id", userController.getUserByID);

// LOGIN
router.post("/login", userController.login)

// SIGN UP
router.post("/signup", stateLocation.getlatlongFromState, userController.signup);

// ACTIVATE ACCOUNT
router.get("/auth/activation/:userID/:otpCode", userController.activateAccount);
router.post("/requestActivationLink", userController.requestActivationLink);

// RESET PASSWORD
router.get("/auth/reset/:userID/:otpCode", userController.getResetPassword);
router.post("/resetPassword", userController.resetPassword);
router.post("/setNewPassword", userController.setPassword);

// EDIT USER PROFILE
router.put("/editProfile/:id", userController.editUserDetails);

// CHANGE USER PASSWORD
router.post("/changePassword", userController.changePassword);


module.exports = router;