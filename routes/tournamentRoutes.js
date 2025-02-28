const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const tournamentController = require('../controllers/tournamentController');

// Public routes
router.get('/list', tournamentController.listTournaments);
router.get('/:id', tournamentController.getTournament);
router.get('/:id/standings', tournamentController.getStandings);
router.get('/:id/matches', tournamentController.getMatches);

// Protected routes
router.get('/create', auth, tournamentController.getCreateForm);
router.post('/create', auth, tournamentController.createTournament);
router.get('/:id/teams', auth, tournamentController.getTeams);
router.post('/:id/teams/add', auth, tournamentController.addTeam);
router.post('/:id/teams/:teamId/remove', auth, tournamentController.removeTeam);
router.get('/:id/settings', auth, tournamentController.getSettings);
router.post('/:id/settings', auth, tournamentController.updateSettings);
router.post('/:id/generate-matches', auth, tournamentController.generateMatches);
router.post('/:id/matches/:matchId', auth, tournamentController.updateMatchResult);
router.post('/:id/matches/:matchId/delete-result', auth, tournamentController.deleteMatchResult);
router.get('/my-tournaments', auth, tournamentController.getMyTournaments);

module.exports = router;