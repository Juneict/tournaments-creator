const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authController = {
    getLogin: (req, res) => {
        res.render('auth/login', { 
            error: null, 
            formData: {},
            returnTo: req.query.returnTo || '/'
        });
    },

    getSignup: (req, res) => {
        res.render('auth/signup', { error: null, formData: {} });
    },

    postSignup: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            
            const existingUser = await User.findOne({ 
                $or: [{ email }, { username }] 
            });
            
            if (existingUser) {
                return res.render('auth/signup', {
                    error: 'Username or email already exists',
                    formData: { username, email }
                });
            }

            const user = await User.create({ username, email, password });
            const token = jwt.sign(
                { userId: user._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.redirect('/');
        } catch (error) {
            console.error(error);
            res.render('auth/signup', {
                error: 'Error creating account',
                formData: req.body
            });
        }
    },

    postLogin: async (req, res) => {
        try {
            const { email, password, returnTo } = req.body;
            
            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                return res.render('auth/login', {
                    error: 'Invalid credentials',
                    formData: { email },
                    returnTo: returnTo || '/'
                });
            }

            const token = jwt.sign(
                { userId: user._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.redirect(returnTo || '/');
        } catch (error) {
            console.error(error);
            res.render('auth/login', {
                error: 'Error logging in',
                formData: req.body,
                returnTo: req.body.returnTo || '/'
            });
        }
    },

    logout: (req, res) => {
        res.clearCookie('token');
        res.redirect('/');
    }
};

module.exports = authController;