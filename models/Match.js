const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    homeTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    awayTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    leg: {
        type: Number,
        required: true
    },
    played: {
        type: Boolean,
        default: false
    },
    result: {
        homeScore: { type: Number },
        awayScore: { type: Number }
    },
    matchDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Match', matchSchema);