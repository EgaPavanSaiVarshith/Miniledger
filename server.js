// Replace with your actual MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://Pavansai:Chintu%40123@pavan.vurav0k.mongodb.net/?retryWrites=true&w=majority&appName=Pavan';

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const User = require('./models/User');
const Expense = require('./models/Expense');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}));
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax', // Use 'lax' for local development
    secure: false    // Set to true if using HTTPS
  }
}));

// Debug: Log session and authentication info
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, done));

// Auth routes

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hash });
  req.session.user = user;
  res.json({ username: user.username });
});


app.post('/api/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'No user' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });
  req.session.user = user;
  res.json({ username: user.username });
});



app.get('/api/logout', (req, res) => {
  req.session.user = null;
  res.json({ message: 'Logged out' });
});

// Expense routes

app.get('/api/expenses', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Not logged in' });
  const expenses = await Expense.find({ user: req.session.user._id });
  res.json(expenses);
});


app.post('/api/expenses', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Not logged in' });
  const { amount, category, description } = req.body;
  const expense = await Expense.create({ user: req.session.user._id, amount, category, description });
  res.json(expense);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on ' + PORT));
