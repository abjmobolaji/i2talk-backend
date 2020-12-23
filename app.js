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
var CronJob = require('cron').CronJob;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
var SocketIOFileUpload = require("socketio-file-upload");
const cors = require("cors");

global.__basedir = __dirname;

var whitelist = ['https://i2talk-chat.herokuapp.com', 'https://i2talk.live', 'http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}


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
const iDairyRoutes = require('./routes/iDairy-route');
const fileRoutes = require('./routes/file-route');

const port = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirectoryPath));
app.use(SocketIOFileUpload.router);
app.use(cors(corsOptions));
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

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/users', usersRoutes);
app.use('/api', userAuthRoutes);
app.use('/api/chatrooms', chatRoomsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/ireminder', iReminderRoutes);
app.use('/api/idairy', iDairyRoutes);
app.use('/api/isearch', iSearchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/attachment', fileRoutes);

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

app.get('/idairy', (req, res) => {
    res.render('iDairy', {
        'title': 'iDairy',
        layout: 'dashboard'
    });
})

app.get('/ireminder', (req, res) => {
    res.render('ireminder', {
        'title': 'iReminder',
        layout: 'dashboard'
    });
})

app.get('/upload', (req, res) => {
    res.render('upload', {
        'title': 'Upload Test', layout: false
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
        const sql = `SELECT * FROM chats WHERE sender = '${isender}' OR receiver = '${isender}' ORDER BY updatedAt DESC`
        connection.query(sql, (err, response) => {
            io.to(isender).emit('chatlist', response);
            
        }); 
        const sql2 = `SELECT * FROM chats WHERE sender = '${receiver}' OR receiver = '${receiver}' ORDER BY updatedAt DESC`
        connection.query(sql2, (err, response) => {
            io.to(receiver).emit('chatlist', response);
            
        }); 
    });

    // Scheduled Message
    socket.on('scheduledChatMessage', ({ chatID, isender, receiver, dateTime, message}) => {
        var getDate = moment(dateTime, "DD-MM-YYYY HH:mm:ss");
        var newDate = getDate.toISOString();
        var date = moment(newDate).format('YYYY-MM-DD H:mm:ss');
        var cronDate = new Date(newDate);

        privateChatMessage.addScheduledMessageToDb(chatID, isender, receiver, date, message);
        const schedule = true;
        const username = isender;
        const text = message;
        socket.emit('messages', { schedule, newDate, username, text });
        var job = uuidv4(); 
        var job = new CronJob(cronDate, function() {
            privateChatMessage.updateScheduledMessage(date, receiver);
            privateChatMessage.addLastMessageToDb(chatID, message);
            socket.to(chatID).emit('messages', chatMessage.formatMessage(isender, message));
            const sql = `SELECT * FROM chats WHERE sender = '${isender}' OR receiver = '${isender}' ORDER BY updatedAt DESC`
            connection.query(sql, (err, response) => {
                io.to(isender).emit('chatlist', response)
            }); 
        });
        job.start();
    });

    // iReminder
    socket.on('reminder', ({ title, message, timeCompleted, creator}) => {
        var cronDate = new Date(timeCompleted);
        console.log('Reminder started')
        var job = uuidv4(); 
        var job = new CronJob(cronDate, function() {
            // const sql = `SELECT * FROM chats WHERE sender = '${isender}' OR receiver = '${isender}' ORDER BY updatedAt DESC`
            // connection.query(sql, (err, response) => {
            //     io.to(isender).emit('chatlist', response)
            // }); 
            console.log(creator)
            io.to(creator).emit('reminderNotification', { title, message })
            
        });
        job.start();
    });

    socket.on('chats', (isender) => {
        socket.join(isender)
    });

    var uploader = new SocketIOFileUpload();
    uploader.dir = "./uploads/chatAttachments";
    uploader.listen(socket);
     // Do something when a file is saved:
    uploader.on("saved", function(event){
        if (event.file.meta.type === "privateChats") {
            event.file.clientDetail.base = event.file.base;
            const eventData = event.file.meta.data
            const link = event.file.pathName.replace(/\\/g,"/");
            var fileName =link.substring(link.lastIndexOf('/')+1);
            const attachment = true;
            const username = eventData.isender;
            const msg = "Attachment"
            privateChatMessage.addAttachmentMessageToDb(eventData.chatID, username, eventData.receiver, link, fileName);
            privateChatMessage.addLastMessageToDb(eventData.chatID, msg);
            io.to(eventData.chatID).emit('messages', { attachment, link, username, fileName });
            const sql = `SELECT * FROM chats WHERE sender = '${username}' OR receiver = '${username}' ORDER BY updatedAt DESC`
            connection.query(sql, (err, response) => {
                io.to(username).emit('chatlist', response);
            }); 
            const sql2 = `SELECT * FROM chats WHERE sender = '${eventData.receiver}' OR receiver = '${eventData.receiver}' ORDER BY updatedAt DESC`
            connection.query(sql2, (err, response) => {
                io.to(eventData.receiver).emit('chatlist', response);
            }); 
        } else {
            const eventData = event.file.meta.chatRoom
            const link = event.file.pathName.replace(/\\/g,"/");
            var fileName =link.substring(link.lastIndexOf('/')+1);
            const attachment = true;
            sql = `SELECT * from chat_rooms_members WHERE socketID = '${socket.id}'`
            connection.query(sql, (err, response) => {
            if (err) return err.sqlMessage
                const currentUser = response[0];
                const username = currentUser.username;
                chatMessage.addchatRoomAttachmentToDb(currentUser.userID, currentUser.username, currentUser.chatRoomId, link, fileName);
                io.to(currentUser.roomName).emit('message', { attachment, link, username, fileName });
            });      
        }
        
    });
 
    // Error handler:
    uploader.on("error", function(event){
        console.log("Error from uploader", event);
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
    console.log(`App listening at http://localhost:${port}`);
});