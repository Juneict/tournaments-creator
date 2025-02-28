const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const ejs = require('ejs');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const { auth, setUser } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const teamRoutes = require('./routes/teamRoutes');

dotenv.config();

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Set user for all routes
app.use(setUser);

// Public routes
app.get('/', (req, res) => {
    res.render('index')
});

app.use('/tournaments', tournamentRoutes);
app.use('/teams', teamRoutes);

// Auth routes
app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});