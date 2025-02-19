const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');

// Get tournament creation form
router.get('/create', (req, res) => {
    res.render('tournaments/create');
});

// Create new tournament
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

module.exports = router;