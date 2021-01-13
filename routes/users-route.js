const express = require('express');

// Required Controllers
const userController = require('../controllers/users-controller');
const stateLocation = require('../middleware/state-location');
const auth = require('../middleware/auth');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

// GET ALL USERS
router.get("/", auth.authenticateUser, [auth.authorizeUser("view_users"), auth.canUser], userController.getUsers); 

// BAN USERS
router.post("/banUser", auth.authenticateUser, [auth.authorizeUser("ban_user"), auth.canUser], userController.banUser);

// UNBAN USERS
router.post("/unbanUser", auth.authenticateUser, [auth.authorizeUser("ban_user"), auth.canUser], userController.unbanUser);

// GET USERS BY ID
router.get("/:id", auth.authenticateUser, userController.getUserByID); 

// EDIT USER PROFILE
router.put("/editProfile", auth.authenticateUser, fileUpload.single('profile-picture'), stateLocation.getlatlongFromState,  userController.editUserDetails);

// CHANGE USER PASSWORD
router.post("/changePassword", auth.authenticateUser, userController.changePassword);

// LOCK PRIVACY
router.post("/lockPrivacy", auth.authenticateUser, userController.lockPrivacy);

// UNLOCK PRIVACY
router.post("/unlockPrivacy", auth.authenticateUser, userController.unlockPrivacy);

// PROMOTE USER
router.post("/promoteUser", auth.authenticateUser, [auth.authorizeUser("promote_user"), auth.canUser], userController.promoteUser);

// DEMOTE USER
router.post("/demoteUser", auth.authenticateUser, [auth.authorizeUser("promote_user"), auth.canUser], userController.demoteUser);


module.exports = router;