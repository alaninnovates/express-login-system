const session = require('express-session');
const express = require('express');
const cookieParser = require('cookie-parser');

const Database = require("@replit/database");
const db = new Database();

const {
    hashPassword,
    checkPassword
} = require('./gen');

const app = express();

app.set('view engine', 'ejs')

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
    /*
    db.list().then(keys => keys.forEach(async k => await db.delete(k)));
    */
    /*
    db.list().then(keys => keys.forEach(async k => console.log(`${k} ${await db.get(k)}`)));
    */
    res.render('pages/index', { session: req.session });
});

app.get('/signup', (req, res) => {
    res.render('pages/signup', { error: '' });
});

app.post('/sign', async (req, res) => {
    const keys = await db.list();

    const username = req.body.username;
    const password1 = req.body.password1;
    const password2 = req.body.password2;

    if (keys.includes(username)) {
        return res.render('pages/signup', { error: 'Already a user with that name.' });
    } else if (username.length < 2) {
        return res.render('pages/signup', { error: 'Username needs to be at least 2 cahracters long' });
    } else if (password1.length < 6) {
        return res.render('pages/signup', { error: 'Password needs to be at least 6 characters long' });
    } else if (password1 !== password2) {
        return res.render('pages/signup', { error: 'Passwords did not match' });
    } else {
        await db.set(username, hashPassword(password1));
        hashPassword(password1)
        req.session.user = username;
        res.redirect('/');
    }
});

app.get('/login', (req, res) => {
    res.render('pages/login', { error: '' });
});

app.post('/log', async (req, res) => {
    const keys = await db.list();

    const username = req.body.username;
    const password = req.body.password;

    if (!keys.includes(username)) {
        return res.render('pages/login', { error: 'Incorrect username or password.' });
    } else if (checkPassword(await db.get(username), password)) {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.render('pages/login', { error: 'Incorrect username or password.' });
    }
});

app.get('/logout', (req, res) => {
    req.session.user = '';
    res.redirect('/');
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server up on port ${process.env.SERVER_PORT}`)
})