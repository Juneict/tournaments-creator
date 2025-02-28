const Team = require('../models/Team');

const teamController = {
    listTeams: async (req, res) => {
        try {
            const teams = await Team.find()
                .sort({ createdAt: -1 });

            res.render('teams/list', { 
                teams});
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    getCreateForm: (req, res) => {
        res.render('teams/create', { error: null, formData: {} });
    },

    createTeam: async (req, res) => {
        try {
            const { name, description } = req.body;
            await Team.create({
                name,
                description,
                createdBy: req.user._id
            });
            res.redirect('/teams/list');
        } catch (error) {
            console.error(error);
            res.render('teams/create', {
                error: 'Failed to create team',
                formData: req.body
            });
        }
    },

    getEditForm: async (req, res) => {
        try {
            console.log(req.params.id);
            const team = await Team.findById(req.params.id);
            
            if (!team) {
                return res.redirect('/teams/list');
            }

            res.render('teams/edit', { 
                team,
                error: null,
                formData: team
            });
        } catch (error) {
            console.error('Error in getEditForm:', error);
            res.redirect('/teams/list');
        }
    },

    updateTeam: async (req, res) => {
        try {
            const team = await Team.findById(req.params.id);

            const { name } = req.body;

            // Validate input
            if (!name || name.trim() === '') {
                return res.render('teams/edit', {
                    team,
                    error: 'Team name is required',
                    formData: req.body
                });
            }

            await Team.findByIdAndUpdate(req.params.id, { 
                name: name.trim()
            });

            res.redirect('/teams/list');
        } catch (error) {
            console.error('Error in updateTeam:', error);
            const team = await Team.findById(req.params.id);
            res.render('teams/edit', {
                team,
                error: 'Failed to update team',
                formData: req.body
            });
        }
    },

    deleteTeam: async (req, res) => {
        try {
            const team = await Team.findById(req.params.id);
            
            await Team.findByIdAndDelete(req.params.id);
            res.redirect('/teams/list');
        } catch (error) {
            console.error(error);
            res.redirect('/teams/list');
        }
    }
};

module.exports = teamController;