const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Team', teamSchema);