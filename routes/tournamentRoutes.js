const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

router.get('/create', (req, res) => {
    res.render('tournaments/create');
});

router.post('/create', async (req, res) => {
    try {
        const { name, format, maxTeams, description } = req.body;
        
        // Temporary user ID until authentication is implemented
        const tempUserId = '65d1234567890123456789ab';

        const tournament = await Tournament.create({
            name,
            format,
            maxTeams,
            description,
            createdBy: tempUserId,
            status: 'draft'
        });

        res.redirect('/tournaments/' + tournament._id);
    } catch (error) {
        console.error(error);
        res.render('tournaments/create', {
            error: 'Failed to create tournament',
            formData: req.body
        });
    }
});

router.get('/list', async (req, res) => {
    try {
        // const tempUserId = '65d1234567890123456789ab';
        
        const tournaments = await Tournament.find()
            .sort({ createdAt: -1 })
        
        res.render('tournaments/list', { 
            tournaments,
            title: 'Tournaments List'
        });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        res.render('tournaments/show', { tournament });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        await Tournament.findByIdAndDelete(req.params.id);
        res.redirect('/tournaments/list');
    } catch (error) {
        console.error(error);
        res.redirect('/tournaments/list');
    }
});

router.get('/:id/teams', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('teams.team');
        const availableTeams = await Team.find({
            _id: { $nin: tournament.teams.map(t => t.team._id) }
        });
        
        res.render('tournaments/teams', { 
            tournament,
            availableTeams
        });
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${req.params.id}`);
    }
});

router.post('/:id/teams/add', async (req, res) => {
    try {
        const { teamId } = req.body;
        const tournament = await Tournament.findById(req.params.id);
        
        if (tournament.teams.length >= tournament.maxTeams) {
            throw new Error('Tournament is full');
        }

        if (!tournament.teams.find(t => t.team.toString() === teamId)) {
            tournament.teams.push({ team: teamId });
            await tournament.save();
        }

        res.redirect(`/tournaments/${req.params.id}/teams`);
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${req.params.id}/teams`);
    }
});

router.post('/:id/teams/:teamId/remove', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        tournament.teams = tournament.teams.filter(t => t.team.toString() !== req.params.teamId);
        await tournament.save();
        
        res.redirect(`/tournaments/${req.params.id}/teams`);
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${req.params.id}/teams`);
    }
});

module.exports = router;