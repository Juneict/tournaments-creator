const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const settingController = require('../controllers/settingController');

router.get('/', auth, settingController.getSettings);
router.post('/update', auth, settingController.updateSettings);

module.exports = router;
