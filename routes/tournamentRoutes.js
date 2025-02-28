const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');

router.get('/create', (req, res) => {
    res.render('tournaments/create');
});

// Update the create route to include default settings
router.post('/create', async (req, res) => {
    try {
        const { name, format, maxTeams, description } = req.body;
        const tempUserId = '65d1234567890123456789ab';

        const tournament = await Tournament.create({
            name,
            format,
            maxTeams,
            description,
            createdBy: tempUserId,
            status: 'draft',
            settings: {
                legsQty: 2,
                pointPerWin: 3,
                pointPerDraw: 1,
                pointPerLose: 0
            }
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

router.get('/:id/setting', async (req, res) => {
    try {
        alert('setting');
        const tournament = await Tournament.findById(req.params.id);
        
        res.render('tournaments/setting', { 
            tournament
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

router.get('/:id/settings', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        res.render('tournaments/settings', { tournament, activeTab: 'settings' });
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${req.params.id}`);
    }
});

router.post('/:id/settings', async (req, res) => {
    try {
        const { legsQty, pointPerWin, pointPerDraw, pointPerLose } = req.body;
        const tournament = await Tournament.findByIdAndUpdate(req.params.id, {
            settings: {
                legsQty: parseInt(legsQty),
                pointPerWin: parseInt(pointPerWin),
                pointPerDraw: parseInt(pointPerDraw),
                pointPerLose: parseInt(pointPerLose)
            }
        }, { new: true });

        res.redirect(`/tournaments/${tournament._id}/settings`);
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${req.params.id}/settings`);
    }
});

router.post('/:id/generate-matches', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('teams.team');
        const teams = tournament.teams.map(t => t.team._id);
        
        // Delete existing matches
        await Match.deleteMany({ tournament: tournament._id });
        
        // Generate matches for each leg
        for (let leg = 1; leg <= tournament.settings.legsQty; leg++) {
            // Generate round-robin matches
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    // For even legs, swap home and away
                    const [homeTeam, awayTeam] = leg % 2 === 0 
                        ? [teams[j], teams[i]]
                        : [teams[i], teams[j]];

                    await Match.create({
                        tournament: tournament._id,
                        homeTeam,
                        awayTeam,
                        leg
                    });
                }
            }
        }

        // Update tournament status
        tournament.status = 'ongoing';
        await tournament.save();

        res.redirect(`/tournaments/${tournament._id}/matches`);
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${tournament._id}`);
    }
});

// Add route to show matches
router.get('/:id/matches', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        const matches = await Match.find({ tournament: tournament._id })
            .populate('homeTeam')
            .populate('awayTeam')
            .sort({ leg: 1, createdAt: 1 });

        res.render('tournaments/matches', { 
            tournament,
            matches,
            activeTab: 'matches'
        });
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${tournament._id}`);
    }
});

// Add route to update match result
router.post('/:id/matches/:matchId', async (req, res) => {
    try {
        const { homeScore, awayScore } = req.body;
        
        await Match.findByIdAndUpdate(req.params.matchId, {
            played: true,
            result: {
                homeScore: parseInt(homeScore),
                awayScore: parseInt(awayScore)
            }
        });

        res.redirect(`/tournaments/${req.params.id}/matches`);
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${req.params.id}/matches`);
    }
});

router.post('/:id/matches/:matchId/delete-result', async (req, res) => {
    try {
        await Match.findByIdAndUpdate(req.params.matchId, {
            played: false,
            result: {
                homeScore: null,
                awayScore: null
            }
        });
        
        res.redirect(`/tournaments/${req.params.id}/matches`);
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${req.params.id}/matches`);
    }
});

router.get('/:id/standings', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('teams.team');
        
        const matches = await Match.find({ 
            tournament: tournament._id,
            played: true 
        }).populate('homeTeam awayTeam');

        // Calculate standings
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

        // Process match results
        matches.forEach(match => {
            const homeTeamStanding = standings.find(s => s.team._id.equals(match.homeTeam._id));
            const awayTeamStanding = standings.find(s => s.team._id.equals(match.awayTeam._id));

            if (homeTeamStanding && awayTeamStanding) {
                // Update matches played
                homeTeamStanding.played++;
                awayTeamStanding.played++;

                // Update goals
                homeTeamStanding.goalsFor += match.result.homeScore;
                homeTeamStanding.goalsAgainst += match.result.awayScore;
                awayTeamStanding.goalsFor += match.result.awayScore;
                awayTeamStanding.goalsAgainst += match.result.homeScore;

                // Update points and results
                if (match.result.homeScore > match.result.awayScore) {
                    homeTeamStanding.won++;
                    awayTeamStanding.lost++;
                    homeTeamStanding.points += tournament.settings.pointPerWin;
                    awayTeamStanding.points += tournament.settings.pointPerLose;
                } else if (match.result.homeScore < match.result.awayScore) {
                    homeTeamStanding.lost++;
                    awayTeamStanding.won++;
                    homeTeamStanding.points += tournament.settings.pointPerLose;
                    awayTeamStanding.points += tournament.settings.pointPerWin;
                } else {
                    homeTeamStanding.drawn++;
                    awayTeamStanding.drawn++;
                    homeTeamStanding.points += tournament.settings.pointPerDraw;
                    awayTeamStanding.points += tournament.settings.pointPerDraw;
                }
            }
        });

        // Calculate goal difference and sort standings
        standings.forEach(s => s.goalDifference = s.goalsFor - s.goalsAgainst);
        standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });

        res.render('tournaments/standings', { 
            tournament,
            standings,
            activeTab: 'standings' 
        });
    } catch (error) {
        console.error(error);
        res.redirect(`/tournaments/${req.params.id}`);
    }
});

module.exports = router;