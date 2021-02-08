// Express
const session = require('express-session');
const express = require('express');
const cookieParser = require('cookie-parser');

// Database
const Database = require("@replit/database");
const db = new Database();

// Hashing util
const {
    hashPassword,
    checkPassword
} = require('./gen');

const app = express();

// Using ejs
app.set('view engine', 'ejs')

// Cookie storage
app.use(cookieParser());
// Session storage
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
// To recieve form data
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {

    /*
    db.list().then(keys => keys.forEach(async k => await db.delete(k)));

    db.list().then(keys => keys.forEach(async k => console.log(`${k} ${await db.get(k)}`)));
    */

    res.render('pages/index', { session: req.session });
});

// Render signup with no error
app.get('/signup', (req, res) => {
    res.render('pages/signup', { error: '' });
});

app.post('/sign', async (req, res) => {
    const keys = await db.list();

    // Form elements
    const username = req.body.username;
    const password1 = req.body.password1;
    const password2 = req.body.password2;

    // If username is already in database
    if (keys.includes(username)) {
        return res.render('pages/signup', { error: 'Already a user with that name.' });
        // If username is under 2 characters
    } else if (username.length < 2) {
        return res.render('pages/signup', { error: 'Username needs to be at least 2 cahracters long' });
        // If password is under 6 characters
    } else if (password1.length < 6) {
        return res.render('pages/signup', { error: 'Password needs to be at least 6 characters long' });
        // If passwords do not match
    } else if (password1 !== password2) {
        return res.render('pages/signup', { error: 'Passwords did not match' });
        // After all the checks, sign up.
    } else {
        await db.set(username, hashPassword(password1));
        hashPassword(password1)
        req.session.user = username;
        res.redirect('/');
    }
});

// Render login page with no error
app.get('/login', (req, res) => {
    res.render('pages/login', { error: '' });
});

app.post('/log', async (req, res) => {
    const keys = await db.list();

    // Form elements
    const username = req.body.username;
    const password = req.body.password;

    // Check if the username is not in the database
    if (!keys.includes(username)) {
        return res.render('pages/login', { error: 'Incorrect username or password.' });
        // Check if the passwords are correct
    } else if (checkPassword(await db.get(username), password)) {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.render('pages/login', { error: 'Incorrect username or password.' });
    }
});

// Delete account
app.get('/delete', (req, res) => {
    res.render('pages/delAccConfirmation', { session: req.session, error: '' })
})

app.post('/rm', async (req, res) => {
    const keys = await db.list();

    // Form elements
    const username = req.body.username;

    // Check if the username is not in the database
    if (!keys.includes(username)) {
        return res.render('pages/delAccConfirmation', { session: req.session, error: 'Incorrect username inputted!' });
        // Delete the account if everything is right
    } else {
        await db.delete(username);
        req.session.user = '';
        res.redirect('/');
    }
})

// Clear the session user and return to homepage
app.get('/logout', (req, res) => {
    req.session.user = '';
    res.redirect('/');
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server up on port ${process.env.SERVER_PORT}`)
})