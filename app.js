const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const warrantysRoutes = require('./routes/warrantys');
const app = express();

//for running update and delete command using Method Override
app.use(methodOverride('_method'));

//for reading public folder for html css and js
app.use(express.static('public'));

//for running ejs files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//to start ejs mate
app.engine('ejs', ejsMate);

//for parsing the body
app.use(express.urlencoded({ extended: true }));

//creating a local mongoose database
mongoose
  .connect('mongodb://localhost:27017/WeSAFE', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected');
  });

//making a session
const sessionConfig = {
  secret: 'i am suhas',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

//using flash for making successful message
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/users', userRoutes);
app.use('/warrantys', warrantysRoutes);

//for home page
app.get('/', (req, res) => {
  res.render('home');
});

//(position matters)
//if nothing from the top matches then this is runned
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

//for handling errors
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message)
    err.message = 'Something Went Wrong , which even i dont know😂😂😢';
  res.status(statusCode).render('error', { err });
});

//starting the Server
app.listen(8000, () => {
  console.log('Server started at 8000');
});
