const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a tournament name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    format: {
        type: String,
        required: [true, 'Please specify tournament format'],
        enum: ['knockout', 'league', 'groups'],
        default: 'league'
    },
    maxTeams: {
        type: Number,
        required: [true, 'Please specify maximum number of teams'],
        min: [2, 'Minimum 2 teams required'],
        max: [32, 'Maximum 32 teams allowed']
    },
    status: {
        type: String,
        enum: ['draft', 'registration', 'ongoing', 'completed'],
        default: 'draft'
    },
    teams: [{
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }],
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

tournamentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Tournament', tournamentSchema);