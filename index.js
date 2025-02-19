const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const ejs = require('ejs');
const path = require('path');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Define Routes here
app.get('/', (req, res) => {
    res.render('index')
  })

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});