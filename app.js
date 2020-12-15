// Required files
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const hbs = require('hbs');
const http = require('http');
const socketio = require('socket.io');

// views path
const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './templates/views');
const partialsPath = path.join(__dirname, './templates/partials');

// Routes
const contactRoutes = require('./routes/contact-route');
const usersRoutes = require('./routes/users-route');
const faqRoutes = require('./routes/faq-route');
const iReminderRoutes = require('./routes/iReminder-route');
const iSearchRoutes = require('./routes/iSearch-route');
const chatRoomsRoutes = require('./routes/chatroom-route');

const port = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirectoryPath));
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

var blocks = {};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});


app.use(bodyParser.json());
app.use('/api/users', usersRoutes);
app.use('/api/chatrooms', chatRoomsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/ireminder', iReminderRoutes);
app.use('/api/isearch', iSearchRoutes);

// view route
app.get('/', (req, res) => {
    res.render('index', {layout: false})
})

app.get('/signup', (req, res) => {
    res.render('signup', {layout: false})
})

app.get('/login', (req, res) => {
    res.render('login', {layout: false})
})

app.get('/about', (req, res) => {
    res.render('about', {
        'title': 'About'
    })
})

app.get('/home', (req, res) => {
    res.render('about', {
        'title': 'Dashboard'
    })
})

app.get('/contact', (req, res) => {
    res.render('contact', {
        'title': 'Contact Us'
    })
})

app.get('/faq', (req, res) => {
    res.render('faq', {
        'title': 'Frequently Asked Questions'
    })
})

app.get('/dashboard', (req, res) => {
    res.render('home', {
        'title': 'Dashboard',
        layout: 'dashboard'
    });
})

app.get('/chatroom', (req, res) => {
    res.render('chatroom', {
        'title': 'Chat Rooms',
        layout: 'dashboard'
    });
})

app.get('/chat-room', (req, res) => {
    res.render('chat-room', {
        'title': 'Chat Rooms',
        layout: 'dashboard'
    });
})

app.use((req, res, next) => {
    const error = new Error('Could not find this route');
    throw error;
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'});
})

// Socket io
io.on('connection', socket => {
    console.log('New WS Socket');

    socket.emit('message', 'Welcome to i2talk')

    socket.broadcast.emit('message', 'A user has joined the chat')

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat')
    })
});

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})