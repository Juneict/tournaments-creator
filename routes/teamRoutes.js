const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Team = require('../models/Team');

// Public routes
router.get('/list', async (req, res) => {
    try {
        const teams = await Team.find().sort({ createdAt: -1 });
        res.render('teams/list', { teams });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// Protected routes
router.get('/create', auth, (req, res) => {
    res.render('teams/create');
});

router.post('/create', auth, async (req, res) => {
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

router.get('/edit/:id', auth, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        res.render('teams/edit', { team });
    } catch (error) {
        console.error(error);
        res.redirect('/teams/list');
    }
});

router.post('/edit/:id', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        await Team.findByIdAndUpdate(req.params.id, { name, description });
        res.redirect('/teams/list');
    } catch (error) {
        console.error(error);
        res.redirect('/teams/list');
    }
});

router.post('/delete/:id', auth, async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);
        res.redirect('/teams/list');
    } catch (error) {
        console.error(error);
        res.redirect('/teams/list');
    }
});

module.exports = router;