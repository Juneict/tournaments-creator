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

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Set user for all routes
app.use(setUser);

// Public routes
app.get('/', (req, res) => {
    res.render('index')
});

app.use('/tournaments', tournamentRoutes);
app.use('/teams', teamRoutes);
app.use('/', authRoutes);

 // 404 handler
 app.use((req, res) => {
  res.status(404).render('error', {
      title: '404 Not Found',
      message: 'Page not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
      title: 'Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;