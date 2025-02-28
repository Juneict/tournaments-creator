const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Auth middleware for protected routes
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login?returnTo=' + encodeURIComponent(req.originalUrl));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            res.clearCookie('token');
            return res.redirect('/login?returnTo=' + encodeURIComponent(req.originalUrl));
        }

        req.user = user;
        res.locals.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.clearCookie('token');
        res.redirect('/login?returnTo=' + encodeURIComponent(req.originalUrl));
    }
};

// User middleware for all routes
const setUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (user) {
                req.user = user;
                res.locals.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

module.exports = { auth, setUser };