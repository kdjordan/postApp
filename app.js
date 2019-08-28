const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const markdown = require('marked');
const sanitizeHTML = require('sanitize-html');
const csrf = require('csurf');
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

app.use(csrf());

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken()
    next();
});

app.use(function(err, req, res, next) {
    if(err.code == 'EBADCSRFTOKEN') {
        req.flash('errors', "Cross site request forgery attack detected");
        req.session.save(() => res.redirect('/'));
    } else {
        req.redirect('404');
    }
});

app.use('/', router);

//here is where we want to add socket.io
const server = require('http').createServer(app);

const io = require('socket.io')(server);

io.use(function(socket, next) {
    sessionOptions(socket.request, socket.request.res, next);
})

io.on('connection', function(socket) {
   if(socket.request.session.user) {
       let user = socket.request.session.user;
        socket.emit('welcome', {username: user.username, avatar: user.avatar});

    socket.on('chatMessageFromBrowser', function(data) {
        socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttrubutes: {}}), username: user.username, avatar: user.avatar});
    })
   }
})

module.exports = server;

