const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const markdown = require('marked');
const sanitizeHTML = require('sanitize-html');
const app = express();

let sessionOptions = session({
    secret: "Hello Friend",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxage: 1000 * 60 * 60 * 24, httpOnly: true}
})

app.use(sessionOptions);
app.use(flash());

//middleware :: locals is an object that will be available in all ejs templates via 'user.<property>'
app.use(function(req, res, next) {
    //make our mardown function available from within ejs template
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown(content), {allowedTags: 
            ['p', 'br', 'ul', 'ol', 'li', 'strong', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        allowedAttributes: {}});
    }

    //make all error and success mssgs available to all templates
    res.locals.errors = req.flash('errors');
    res.locals.success = req.flash('success');

    //make current user id available on the req object
    if(req.session.user) {
        req.visitorID = req.session.user._id;
    } else {
        req.visitorID = 0;
    }
    //make user session data available from within view templates
    res.locals.user = req.session.user;
    next();
});

const router = require('./router');

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use('/', router);

module.exports = app;

