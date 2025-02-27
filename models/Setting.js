const  mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    legsQty: {
        type: Number,
        required: true,
        trim: true
    },
    pointPerWin : {
        type: Number,
        required: true,
        trim: true
    },
    pointPerDraw : {
        type: Number,
        required: true,
        trim: true
    },
    pointPerLose : {
        type: Number,
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

module.exports = mongoose.model('Setting', settingSchema);