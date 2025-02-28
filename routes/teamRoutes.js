const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const teamController = require('../controllers/teamController');

// Public routes
router.get('/list', teamController.listTeams);

// Protected routes
router.get('/create', auth, teamController.getCreateForm);
router.post('/create', auth, teamController.createTeam);
router.get('/edit/:id', auth, teamController.getEditForm);
router.post('/edit/:id', auth, teamController.updateTeam);
router.post('/delete/:id', auth, teamController.deleteTeam);

module.exports = router;