const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

router.get('/setting', async (req, res) => {
    try {
        const teams = await Team.find().sort({ createdAt: -1 });
        res.render('teams/list', { teams });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

module.exports = router;
