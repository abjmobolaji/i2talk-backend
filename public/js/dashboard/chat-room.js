var messageScreen = document.getElementById("messages");
var messageForm = document.getElementById("messageForm");
const msgInput = document.getElementById("msg-input");
var leaveRoom = document.getElementById("leaveRoomidd");
var Chatheader = document.getElementById("chat-header");
var userData = JSON.parse(localStorage.getItem("token"))
var userID = userData.data.userID;
var username = userData.data.username;
var token = userData.accessToken
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomId = urlParams.get('id');
const roomName = urlParams.get('name')



const socket = io();


socket.emit('joinRoom', { username, userID, roomName, roomId });

socket.on('message', message => {
    console.log(message)
    outputMessage(message)

    // scroll down
    // chatMessages.scrollTop = chatMessages.scrollHeight;
})



messageForm.addEventListener("submit", event => {
    event.preventDefault();
    var msg = msgInput.value;
    socket.emit('chatMessage', msg)

    // clear message input
    msgInput.value = '';
    msgInput.focus(); 
});

messageForm.addEventListener('keypress', handleKeyPress);
messageForm.addEventListener('keyup', handleKeyUp);


socket.on("typing",  (data) => {
    const{ cusername, isTyping }  = data;
    if (!isTyping) {
        // document.getElementById("messs").innerHTML = "";
        document.getElementById("typing").innerHTML = "";
    }
    else {
        if (cusername != username) {
        var msgs = `
          <li class="mchat-msg-other">
          <span id="chat-new">
          <p><b>${cusername}</b> is typing<p>
          </span>
      </li>
      `
      document.getElementById("typing").innerHTML = msgs;
        }
    }

});

let timer,
timeoutVal = 1000; // time it takes to wait for user to stop typing in ms
    // when user is pressing down on keys, clear the timeout
    function handleKeyPress(e) {
        window.clearTimeout(timer);
        socket.emit("typing", true);
    }
    // when the user has stopped pressing on keys, set the timeout
    // if the user presses on keys before the timeout is reached, then this timeout is canceled
    function handleKeyUp(e) {
        window.clearTimeout(timer); // prevent errant multiple timeouts from being generated
        timer = window.setTimeout(() => {
        socket.emit("typing", false);
        }, timeoutVal);
    }

function outputMessage(message) {
    if (message.username === username) {
            var msg = `
            <li class="mchat-msg-self">
            <span id="chat-new">
            <p>${message.text}<p>
            </span>
        </li>
        `
    } else {
            var msg = `
            <li class="mchat-msg-other">
            <span id="chat-new">
            <p><i class="namee">${message.username}: </i> ${message.text}</p>
            </span>
        </li>
        `
    }
    messageScreen.innerHTML += msg;
    document.getElementById("messages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
}

function getChatRooms(token, roomId) {
  fetch(`http://localhost:3000/api/chatrooms/messages/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
      }
      }).then((response) => {
        if (response.status == 200){
          response.json().then((data) => {
              console.log(data.data)
              var chatRoomMessages = data.data;
              for (i=0; i<= chatRoomMessages.length; i++) {
                if(chatRoomMessages[i]!=null || chatRoomMessages[i]!=undefined )
                {
                    if (chatRoomMessages[i].username === username) {
                        var msg = `
                        <li class="mchat-msg-self">
                        <span id="chat-new">
                        <p><b>${chatRoomMessages[i].timePosted}</b> - ${chatRoomMessages[i].message}<p>
                        </span>
                    </li>
                    `
                } else {
                        var msg = `
                        <li class="mchat-msg-other">
                        <span id="chat-new">
                        <p><i class="namee">${chatRoomMessages[i].username}: </i> ${chatRoomMessages[i].message}</p>
                        </span>
                    </li>
                    `
                }
                messageScreen.innerHTML += msg;
                }
                document.getElementById("messages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
              }
              
              
        })
        } else {
          
        }
      }).catch(function(error) {
        console.log('Request failed', error)
    });
}
getChatRooms(token, roomId);

// var unsubscribe = msgRef.where("chat_room_id", "==", chatId).onSnapshot(snapshot => {
//         if (snapshot.docChanges()[0] === undefined) {
    //         const msg = `
    //             <li id="no-msg" class="mchat-msg-other">
    //             <span id="chat-new">
    //             <p>No Previous Messages found. Send message now to Start Chatting!</p>
    //             </span>
    //         </li>
    // `
    // messageScreen.innerHTML += msg;
    // setTimeout(function(){ 
    // var elem = document.querySelector('#no-msg');
    // elem.parentNode.removeChild(elem);
    // }, 3000);

//         } else {
//         shown = snapshot.docChanges()[0].doc.data()
//         // console.log(shown)
//         const {sender, text} = shown;
//         if (shown) {
//             if (!shown.createdAt && snapshot.metadata.hasPendingWrites) {
//                 // we don't have a value for createdAt yet
//                 // const ts = firebase.firestore.Timestamp.now()
//                 // console.log(`timestamp: ${ts} (estimated)`)
//             }
//             else {
//                 // now we have the final timestamp value
                
//                 // console.log(`timestamp: ${shown.createdAt} (actual)`)
//             }}
//         }
//         leaveRoom.addEventListener("click", function() {
//             unsubscribe();
//             localStorage.removeItem("chatId");
//             window.location.assign("chatroom.html")
//         })
//     });

// function showChats() {
//     msgRef.where("chat_room_id", "==", chatId).orderBy("timestamp", "asc").get().then((querySnapshot) => {                                                                                                                                                                                                                                                                                                                                              
//         querySnapshot.forEach((doc) => {
//             const {sender, text} = doc.data();
//             if (sender === loggedUser) {
//                 var msg = `
//                     <li class="mchat-msg-self">
//                     <span id="chat-new">
//                     <p>${text}<p>
//                     </span>
//                 </li>
//                 `
//             } else {
//                 var msg = `
//                 <li class="mchat-msg-other">
//                 <span id="chat-new">
//                 <p><i class="namee">${sender}: </i> ${text}</p>
//                 </span>
//             </li>
//             `
//             }
//     messageScreen.innerHTML += msg;
//         });
//     });
//     setTimeout(function(){ document.getElementById("messages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})}, 1000);
// }


// Chat room

// function enterChatroom(chatroomName) {
//     ChatroomName = chatroomName.getAttribute("data-chatroom-name");
//     localStorage.setItem("chatroomName", JSON.stringify(ChatroomName));
//     chatId = chatroomName.getAttribute("data-chatroom-id");
//     localStorage.setItem("chatId", JSON.stringify(chatId));
//     window.location.assign(`chat-room.html`)
// }

var t = document.createTextNode(`${roomName} Group Chat`);     // Create a text node
Chatheader.appendChild(t);