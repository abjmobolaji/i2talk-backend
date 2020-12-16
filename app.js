// Required files
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const hbs = require('hbs');
const http = require('http');
const socketio = require('socket.io');
const chatMessage = require('./util/chatroom/message');
const joinRoom = require('./util/chatroom/user');
const connection = require('./models/db');
const privateChats = require('./util/private-chat/user');
const privateChatMessage = require('./util/private-chat/messages');


// views path
const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './templates/views');
const partialsPath = path.join(__dirname, './templates/partials');

// Routes
const contactRoutes = require('./routes/contact-route');
const usersRoutes = require('./routes/users-route');
const userAuthRoutes =  require('./routes/user-auth-route');
const faqRoutes = require('./routes/faq-route');
const iReminderRoutes = require('./routes/iReminder-route');
const iSearchRoutes = require('./routes/iSearch-route');
const chatRoomsRoutes = require('./routes/chatroom-route');
const chatRoutes= require('./routes/chat-route');

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

    block.push(context.fn(this)); 
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});


app.use(bodyParser.json());
app.use('/api/users', usersRoutes);
app.use('/api', userAuthRoutes);
app.use('/api/chatrooms', chatRoomsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/ireminder', iReminderRoutes);
app.use('/api/isearch', iSearchRoutes);
app.use('/api/chats', chatRoutes);

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

app.get('/isearch', (req, res) => {
    res.render('isearch', {
        'title': 'iSearch',
        layout: 'dashboard'
    });
})

app.get('/privatechat', (req, res) => {
    res.render('privatechat', {
        'title': 'Chat',
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
const botName = "i2tak Bot"
io.on('connection', socket => {
    // Run when client connects
  
    socket.on('joinRoom', ({ username, userID, roomName, roomId }) => {
        // console.log(socket.rooms);

        const user = joinRoom.userJoinChatRoom(socket.id, userID, roomId, username, roomName);
        socket.join(user.roomName)

        // Welcome current User
        socket.emit('message', chatMessage.formatMessage(botName, `Welcome to i2talk ${user.roomName} ChatRoom`));

        // Broadcast when a user connects
        socket.broadcast
        .to(user.roomName)
        .emit('message', chatMessage.formatMessage(botName, `${user.username} has joined the chat room`))

        // send users and room info
        // io.to(user.room).emit('roomUsers', {
        //     room: user.room,
        //     users: getRoomUsers(user.room)
        // })
    });
    

     // LIsten for chatMessage
     socket.on('chatMessage', msg => {
        sql = `SELECT * from chat_rooms_members WHERE socketID = '${socket.id}'`
        connection.query(sql, (err, response) => {
            if (err) return err.sqlMessage
                const currentUser = response[0];
                chatMessage.addMessageToDb(currentUser.userID, currentUser.username, currentUser.chatRoomId, msg);
                io.to(currentUser.roomName).emit('message', chatMessage.formatMessage(currentUser.username, msg));
            });
    })

    // typing indicator
    socket.on("typing", function (isTyping) {
        console.log("typing");
        sql = `SELECT * from chat_rooms_members WHERE socketID = '${socket.id}'`
        connection.query(sql, (err, response) => {
            if (err) return err.sqlMessage
                const currentUser = response[0];
                const cusername = currentUser.username
                console.log(currentUser.roomName)
                io.to(currentUser.roomName).emit("typing", { cusername, isTyping });
        });
        
      });

    //   Private Chats
      socket.on('privateChats', ({ chatID, isender, receiver }) => {
        const user = privateChats.createChat( chatID, isender, receiver);
        socket.join(user.chatID)
    });

    socket.on("Ptyping", function ({chatID, status, isender}) {
        const sender = isender
        io.to(chatID).emit("typing", { sender, status });
    });

    // LIsten for chatMessage
    socket.on('privateChatMessage', ({chatID, isender, receiver, msg}) => {
        privateChatMessage.addMessageToDb(chatID, isender, receiver, msg);
        privateChatMessage.addLastMessageToDb(chatID, msg);
        io.to(chatID).emit('messages', chatMessage.formatMessage(isender, msg));
    });
  
     // Runs when client disconnects
    socket.on('disconnect', () => {
        console.log(socket.id)
        sql = `SELECT * from chat_rooms_members WHERE socketID = '${socket.id}'`
        connection.query(sql, (err, response) => {
            if (err) return err.sqlMessage
            const currentUser = response[0];
            if (currentUser) {
                
                io.to(currentUser.roomName).emit(
                    'message', 
                    chatMessage.formatMessage(botName, `${currentUser.username} has left the chat`)
                );
            } 
        })
         joinRoom.userLeave(socket.id)
        
        // console.log(user);
        // if (user) {
        //     io.to(user.room).emit(
        //         'message', 
        //         formatMessage(botName, `${user.username} has left the chat`)
        //     );

        //     // io.to(user.room).emit('roomUsers', {
        //     //     room: user.room,
        //     //     users: getRoomUsers(user.room)
        //     // });
        // }
    });
});


server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});