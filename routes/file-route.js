// Required files
const express = require('express');

// Required Controllers
const fileControllers = require('../controllers/file-controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/attachment/:path', fileControllers.downloadAttachment);
router.get('/users/:path', fileControllers.userProfile);

module.exports = router;