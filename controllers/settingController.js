const Setting = require('../models/Setting');
const Team = require('../models/Team');

const settingController = {
    getSettings: async (req, res) => {
        try {
            const settings = await Setting.findOne();
            const teams = await Team.find().sort({ createdAt: -1 });
            
            res.render('settings/index', { 
                settings: settings || {},
                teams,
                error: null,
                success: null
            });
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    updateSettings: async (req, res) => {
        try {
            let settings = await Setting.findOne();

            if (!settings) {
                settings = new Setting();
            }

            // Update settings with form data
            settings.pointSystem = {
                win: parseInt(req.body.pointPerWin),
                draw: parseInt(req.body.pointPerDraw),
                lose: parseInt(req.body.pointPerLose)
            };

            settings.matchRules = {
                legsPerMatch: parseInt(req.body.legsPerMatch),
                maxTeamsPerTournament: parseInt(req.body.maxTeamsPerTournament)
            };

            await settings.save();

            res.redirect('/settings?success=true');
        } catch (error) {
            console.error(error);
            res.redirect('/settings?error=true');
        }
    }
};

module.exports = settingController;