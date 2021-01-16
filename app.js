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
// const io = socketio(server);
app.use(cors(corsOptions));
const io = socketio(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
}); 
app.use(express.static(publicDirectoryPath));
app.use(SocketIOFileUpload.router);

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
app.use('/files', fileRoutes);

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
    res.render('iSearch', {
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

const chat = io.of('/chats')
chat.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  // Join a conversation
//   const { isender, receiver, chatID } = socket.handshake.query;
//   console.log(chatID, isender, receiver);
socket.on("NEW_CHAT_EVENT", ({ isender, chatID, receiver}) => {
console.log(chatID, isender, receiver, "working");
  privateChats.createChat(isender, receiver);
  socket.join(chatID);
});
//   chat.in(user.chatID).emit(USER_JOIN_CHAT_EVENT, user);
  // Listen for new messages
  socket.on("NEW_CHAT_MESSAGE_EVENT", (data) => {
    const message = { ...data };
    privateChatMessage.addMessageToDb(message.chatID, message.user.isender, message.user.receiver, message.message, (id) => {
        privateChatMessage.sendChatMessage(id, (response) => {
            chat.in(message.chatID).emit("NEW_CHAT_MESSAGE_EVENT", response);
        });
    });
    privateChatMessage.addLastMessageToDb(message.chatID, message.message);
    setTimeout(function() {  
        privateChatMessage.updateChatMessageList(message.user.isender, (response) => {
            // chat.in(message.user.isender).emit('chatlist', response);
        });
        privateChatMessage.updateChatMessageList(message.user.receiver, (response) => {
            // chat.in(message.user.receiver).emit('chatlist', response);
        });
    }, 200);
  });

    //     // Listen typing events
    // socket.on("START_TYPING_MESSAGE_EVENT", (data) => {
    //     chat.in(chatID).emit("START_TYPING_MESSAGE_EVENT", data);
    // });
    // socket.on("STOP_TYPING_MESSAGE_EVENT", (data) => {
    //     chat.in(chatID).emit("STOP_TYPING_MESSAGE_EVENT", data);
    // });

    socket.on('NEW_SCHEDULE_MESSAGE_EVENT', (data) => {
        const message = { ...data };
        console.log("working")
        console.log(message)
        var getDate = moment(message.dateTime, "DD-MM-YYYY HH:mm:ss");
        var newDate = getDate.toISOString();
        var date = moment(newDate).format('YYYY-MM-DD H:mm:ss');
        var cronDate = new Date(newDate);
        privateChatMessage.addScheduledMessageToDb(message.chatID, message.user.isender, message.user.receiver, date, message.message );
        var job = uuidv4(); 
        var job = new CronJob(cronDate, function() {
            privateChatMessage.updateScheduledMessage(date, message.user.receiver , (id) => {
                privateChatMessage.sendChatMessage(id, (response) => {
                    chat.in(message.chatID).emit("NEW_CHAT_MESSAGE_EVENT", response);
            })});
            privateChatMessage.addLastMessageToDb(message.chatID, message.message);
            // socket.to(chatID).emit('messages', chatMessage.formatMessage(isender, message));
            // const sql = `SELECT * FROM chats WHERE sender = '${isender}' OR receiver = '${isender}' ORDER BY updatedAt DESC`
            // connection.query(sql, (err, response) => {
            //     io.to(isender).emit('chatlist', response)
            // }); 
        });
        job.start()
    });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    // socket.leave(chatID);
  });
});


// Socket io
const botName = "i2tak Bot";

io.on('connection', socket => {

    console.log(`${socket.id} connected`);

    // Join a conversation
    const { username, userID, roomName, roomId } = socket.handshake.query;
    socket.join(roomName);
  
    const user = joinRoom.userJoinChatRoom(socket.id, userID, roomId, username, roomName);
    io.in(roomName).emit("USER_JOIN_CHAT_EVENT", user);
  
    // Listen for new messages
    socket.on("NEW_CHAT_MESSAGE_EVENT", (data) => {
        const message = { roomName, ...data };
        console.log(message)
        chatMessage.addMessageToDb(message.user.userId, message.user.username, message.chatRoomId, message.message, (id) => {
            chatMessage.sendChatMessage(id, (response) => {
                io.in(roomName).emit("NEW_CHAT_MESSAGE_EVENT", response)
            });
        });
    });

    // Listen typing events
    socket.on("START_TYPING_MESSAGE_EVENT", (data) => {
        chat.in(roomName).emit("START_TYPING_MESSAGE_EVENT", data);
    });
    socket.on("STOP_TYPING_MESSAGE_EVENT", (data) => {
        chat.in(roomName).emit("STOP_TYPING_MESSAGE_EVENT", data);
    });
  
// ----------------------------------------------------------------------------------------------------------------------//
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

    });
    

     // LIsten for chatMessage
     socket.on('chatMessage', msg => {
         joinRoom.getCurrentUser(socket.id, (currentUser) => {
             chatMessage.addMessageToDb(currentUser.userID, currentUser.username, currentUser.chatRoomId, msg);
             io.to(currentUser.roomName).emit('message', chatMessage.formatMessage(currentUser.username, msg));
         });
    });


    // typing indicator
    socket.on("typing", function (isTyping) {
        joinRoom.getCurrentUser(socket.id, (currentUser) => {
            const cusername = currentUser.username
            io.to(currentUser.roomName).emit("typing", { cusername, isTyping });
        });
    });

    //   Private Chats
      socket.on('privateChats', ({ isender, receiver }) => {
        const user = privateChats.createChat(isender, receiver);
        socket.join(user.chatID);
    });

    
    socket.on("Ptyping", function ({chatID, status, isender}) {
        const sender = isender
        io.to(chatID).emit("typing", { sender, status });
    });

    // LIsten for chatMessage
    socket.on('privateChatMessage', ({chatID, isender, receiver, msg}) => {
        privateChatMessage.addMessageToDb(chatID, isender, receiver, msg, (id) => {
            privateChatMessage.sendChatMessage(id, (response) => {
                const pchatID = response.chatID;
                const psender = response.sender;
                const pmsg = response.message;
                io.to(pchatID).emit('messages', chatMessage.formatMessage(psender, pmsg));
            });
        });
        privateChatMessage.addLastMessageToDb(chatID, msg);
        setTimeout(function() {  
            privateChatMessage.updateChatMessageList(isender, (response) => {
                io.to(isender).emit('chatlist', response);
            });
            privateChatMessage.updateChatMessageList(receiver, (response) => {
                io.to(receiver).emit('chatlist', response);
            });
        }, 200);
        
    });

    // Scheduled Message
    socket.on('scheduledChatMessage', ({ chatID, isender, receiver, dateTime, message}) => {
        console.log(dateTime)
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
            joinRoom.getCurrentUser(socket.id, (currentUser) => {
                const username = currentUser.username;
                chatMessage.addchatRoomAttachmentToDb(currentUser.userID, currentUser.username, currentUser.chatRoomId, link, fileName);
                io.to(currentUser.roomName).emit('message', { attachment, link, username, fileName });
            })
        }
        
    });
 
    // Error handler:
    uploader.on("error", function(event){
        console.log("Error from uploader", event);
    });

  
     // Runs when client disconnects
    socket.on('disconnect', () => {
        joinRoom.getCurrentUser(socket.id, (currentUser) => {
            if (currentUser) {
                io.to(currentUser.roomName).emit(
                    'message', 
                    chatMessage.formatMessage(botName, `${currentUser.username} has left the chat`)
                );
            } 
            setTimeout(function(){ 
                joinRoom.userLeave(socket.id);
             }, 5000);
        })
    });
});

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});