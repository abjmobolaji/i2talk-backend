// Required files
const express = require('express');

// Required Controllers
const fileControllers = require('../controllers/file-controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:path', fileControllers.download);

module.exports = router;