const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');

const tournamentController = {
    listTournaments: async (req, res) => {
        try {
            const tournaments = await Tournament.find()
                .populate('teams.team')
                .populate('createdBy', 'username');

            const tournamentsWithOwnership = tournaments.map(tournament => ({
                ...tournament.toObject(),
                isOwner: req.user && tournament.createdBy._id.equals(req.user._id)
            }));

            res.render('tournaments/list', { 
                tournaments: tournamentsWithOwnership,
                currentUser: req.user
            });
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    getCreateForm: async (req, res) => {
        res.render('tournaments/create', { error: null, formData: {} });
    },

    createTournament: async (req, res) => {
        try {
            const tournament = await Tournament.create({
                ...req.body,
                createdBy: req.user._id,
                status: 'draft',
                settings: {
                    legsQty: 2,
                    pointPerWin: 3,
                    pointPerDraw: 1,
                    pointPerLose: 0
                }
            });

            res.redirect(`/tournaments/${tournament._id}`);
        } catch (error) {
            console.error(error);
            res.render('tournaments/create', {
                error: 'Failed to create tournament',
                formData: req.body
            });
        }
    },

    getTournament: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id)
                .populate('teams.team')
                .populate('createdBy', 'username');
            
            if (!tournament) {
                return res.redirect('/tournaments/list');
            }

            res.render('tournaments/show', { 
                tournament,
                isOwner: req.user && tournament.createdBy.equals(req.user._id)
            });
        } catch (error) {
            console.error(error);
            res.redirect('/tournaments/list');
        }
    },

    getSettings: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id)
                .populate('createdBy', 'username');
            
            if (!tournament) {
                return res.redirect('/tournaments/list');
            }

            res.render('tournaments/settings', { 
                tournament,
                activeTab: 'settings',
                query: req.query,
                isOwner: req.user && tournament.createdBy.equals(req.user._id)
            });
        } catch (error) {
            console.error(error);
            res.redirect('/tournaments/list');
        }
    },

    updateSettings: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id);
            
            if (!tournament || !req.user || !tournament.createdBy.equals(req.user._id)) {
                return res.redirect('/tournaments/list');
            }

            if (tournament.status !== 'draft') {
                return res.redirect(`/tournaments/${tournament._id}/settings?error=locked`);
            }

            tournament.settings = {
                legsQty: parseInt(req.body.legsQty),
                pointPerWin: parseInt(req.body.pointPerWin),
                pointPerDraw: parseInt(req.body.pointPerDraw),
                pointPerLose: parseInt(req.body.pointPerLose)
            };

            await tournament.save();
            res.redirect(`/tournaments/${tournament._id}/settings?success=true`);
        } catch (error) {
            console.error(error);
            res.redirect(`/tournaments/${req.params.id}/settings?error=true`);
        }
    },

    generateMatches: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id)
                .populate('teams.team');

            if (!tournament || !req.user || !tournament.createdBy.equals(req.user._id)) {
                return res.redirect('/tournaments/list');
            }

            // Generate round-robin matches
            const teams = tournament.teams.map(t => t.team);
            const matches = [];

            for (let leg = 1; leg <= tournament.settings.legsQty; leg++) {
                for (let i = 0; i < teams.length; i++) {
                    for (let j = i + 1; j < teams.length; j++) {
                        matches.push({
                            tournament: tournament._id,
                            homeTeam: teams[i]._id,
                            awayTeam: teams[j]._id,
                            leg,
                            played: false
                        });
                    }
                }
            }

            await Match.insertMany(matches);
            tournament.status = 'ongoing';
            await tournament.save();

            res.redirect(`/tournaments/${tournament._id}/matches`);
        } catch (error) {
            console.error(error);
            res.redirect(`/tournaments/${req.params.id}?error=generate`);
        }
    },

    getMatches: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id)
                .populate('createdBy', 'username');
            const matches = await Match.find({ tournament: tournament._id })
                .populate('homeTeam')
                .populate('awayTeam')
                .sort({ leg: 1, createdAt: 1 });

            res.render('tournaments/matches', { 
                tournament,
                matches,
                activeTab: 'matches',
                isOwner: req.user && tournament.createdBy.equals(req.user._id)
            });
        } catch (error) {
            console.error(error);
            res.redirect('/tournaments/list');
        }
    },

    updateMatchResult: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id);
            
            if (!tournament || !req.user || !tournament.createdBy.equals(req.user._id)) {
                return res.redirect('/tournaments/list');
            }

            await Match.findByIdAndUpdate(req.params.matchId, {
                played: true,
                result: {
                    homeScore: parseInt(req.body.homeScore),
                    awayScore: parseInt(req.body.awayScore)
                }
            });

            res.redirect(`/tournaments/${tournament._id}/matches`);
        } catch (error) {
            console.error(error);
            res.redirect(`/tournaments/${req.params.id}/matches`);
        }
    },

    deleteMatchResult: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id);
            
            if (!tournament || !req.user || !tournament.createdBy.equals(req.user._id)) {
                return res.redirect('/tournaments/list');
            }

            await Match.findByIdAndUpdate(req.params.matchId, {
                played: false,
                result: {
                    homeScore: null,
                    awayScore: null
                }
            });

            res.redirect(`/tournaments/${tournament._id}/matches`);
        } catch (error) {
            console.error(error);
            res.redirect(`/tournaments/${req.params.id}/matches`);
        }
    },

    getMyTournaments: async (req, res) => {
        try {
            const tournaments = await Tournament.find({ createdBy: req.user._id })
                .populate('teams.team')
                .populate('createdBy', 'username');

            res.render('tournaments/list', { 
                tournaments,
                currentUser: req.user,
                title: 'My Tournaments'
            });
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    getStandings: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id)
                .populate('teams.team')
                .populate('createdBy', 'username');
            
            const matches = await Match.find({ 
                tournament: tournament._id,
                played: true 
            }).populate('homeTeam awayTeam');

            const standings = tournament.teams.map(entry => ({
                team: entry.team,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                points: 0
            }));

            matches.forEach(match => {
                const homeTeamStanding = standings.find(s => s.team._id.equals(match.homeTeam._id));
                const awayTeamStanding = standings.find(s => s.team._id.equals(match.awayTeam._id));

                if (homeTeamStanding && awayTeamStanding) {
                    // Update standings based on match result
                    updateStandingsForMatch(homeTeamStanding, awayTeamStanding, match, tournament.settings);
                }
            });

            // Calculate goal difference and sort standings
            standings.forEach(s => s.goalDifference = s.goalsFor - s.goalsAgainst);
            sortStandings(standings);

            res.render('tournaments/standings', { 
                tournament,
                standings,
                activeTab: 'standings',
                isOwner: req.user && tournament.createdBy.equals(req.user._id)
            });
        } catch (error) {
            console.error(error);
            res.redirect(`/tournaments/${req.params.id}`);
        }
    },

    getTeams: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id)
                .populate('teams.team')
                .populate('createdBy', 'username');
            
            const availableTeams = await Team.find({
                _id: { $nin: tournament.teams.map(t => t.team._id) }
            });

            res.render('tournaments/teams', { 
                tournament,
                availableTeams,
                activeTab: 'teams',
                isOwner: req.user && tournament.createdBy.equals(req.user._id)
            });
        } catch (error) {
            console.error(error);
            res.redirect(`/tournaments/${req.params.id}`);
        }
    },

    addTeam: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id);
            
            if (!tournament || !req.user || !tournament.createdBy.equals(req.user._id)) {
                return res.redirect('/tournaments/list');
            }

            if (tournament.teams.length >= tournament.maxTeams) {
                throw new Error('Tournament is full');
            }

            if (!tournament.teams.find(t => t.team.toString() === req.body.teamId)) {
                tournament.teams.push({ team: req.body.teamId });
                await tournament.save();
            }

            res.redirect(`/tournaments/${tournament._id}/teams`);
        } catch (error) {
            console.error(error);
            res.redirect(`/tournaments/${req.params.id}/teams`);
        }
    },

    removeTeam: async (req, res) => {
        try {
            const tournament = await Tournament.findById(req.params.id);
            
            if (!tournament || !req.user || !tournament.createdBy.equals(req.user._id)) {
                return res.redirect('/tournaments/list');
            }

            tournament.teams = tournament.teams.filter(t => t.team.toString() !== req.params.teamId);
            await tournament.save();

            res.redirect(`/tournaments/${tournament._id}/teams`);
        } catch (error) {
            console.error(error);
            res.redirect(`/tournaments/${req.params.id}/teams`);
        }
    }
};

// Helper functions
function updateStandingsForMatch(homeTeamStanding, awayTeamStanding, match, settings) {
    homeTeamStanding.played++;
    awayTeamStanding.played++;

    homeTeamStanding.goalsFor += match.result.homeScore;
    homeTeamStanding.goalsAgainst += match.result.awayScore;
    awayTeamStanding.goalsFor += match.result.awayScore;
    awayTeamStanding.goalsAgainst += match.result.homeScore;

    if (match.result.homeScore > match.result.awayScore) {
        homeTeamStanding.won++;
        awayTeamStanding.lost++;
        homeTeamStanding.points += settings.pointPerWin;
        awayTeamStanding.points += settings.pointPerLose;
    } else if (match.result.homeScore < match.result.awayScore) {
        homeTeamStanding.lost++;
        awayTeamStanding.won++;
        homeTeamStanding.points += settings.pointPerLose;
        awayTeamStanding.points += settings.pointPerWin;
    } else {
        homeTeamStanding.drawn++;
        awayTeamStanding.drawn++;
        homeTeamStanding.points += settings.pointPerDraw;
        awayTeamStanding.points += settings.pointPerDraw;
    }
}

function sortStandings(standings) {
    standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });
}

module.exports = tournamentController;