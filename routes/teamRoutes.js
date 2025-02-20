const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Temporary user configuration
const tempUserId = '65d1234567890123456789ab';

// List teams
router.get('/list', async (req, res) => {
    try {
        const teams = await Team.find().sort({ createdAt: -1 });
        res.render('teams/list', { teams });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// Create team form
router.get('/create', (req, res) => {
    res.render('teams/create');
});

// Create team
router.post('/create', async (req, res) => {
    try {
        const { name, description } = req.body;
        await Team.create({
            name,
            description,
            createdBy: tempUserId
        });
        res.redirect('/teams/list');
    } catch (error) {
        console.error(error);
        res.render('teams/create', {
            error: 'Failed to create team',
            formData: req.body
        });
    }
});

// Update team form
router.get('/edit/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        res.render('teams/edit', { team });
    } catch (error) {
        console.error(error);
        res.redirect('/teams/list');
    }
});

// Update team
router.post('/edit/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        await Team.findByIdAndUpdate(req.params.id, { name, description });
        res.redirect('/teams/list');
    } catch (error) {
        console.error(error);
        res.redirect('/teams/list');
    }
});

// Delete team
router.post('/delete/:id', async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);
        res.redirect('/teams/list');
    } catch (error) {
        console.error(error);
        res.redirect('/teams/list');
    }
});

module.exports = router;