const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');

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

module.exports = router;