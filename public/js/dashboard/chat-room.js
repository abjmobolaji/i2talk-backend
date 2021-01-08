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
var siofu = new SocketIOFileUpload(socket);

socket.emit('joinRoom', { username, userID, roomName, roomId });

socket.on('message', message => {
    console.log(message)
})


function submitFunction(i) {
    if (i==1) {
        var msg = msgInput.value;
        socket.emit('chatMessage', msg)
    }
    if (i==2) {
        document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
        let loader = `
                <div class="progress-bar" id="progressBar">
                    <div class="progress-bar-fill">
                        <span class="progress-bar-text">0%</span>
                    </div>
                </div>
        `
    messageScreen.innerHTML += loader;
    document.getElementById("messages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    //     var chatData = {
    //         chatID,
    //         isender,
    //         receiver
    // };
    siofu.addEventListener("start", function(event){
        // event.file.meta.chatRoom = chatData;
        event.file.meta.type = "chatRoom";
    });
    // Do something on upload progress:
    siofu.addEventListener("progress", function(event){
        const progressBarFill = document.querySelector("#progressBar > .progress-bar-fill");
    const progressBarText = progressBarFill.querySelector(".progress-bar-text")
        var percent = event.bytesLoaded / event.file.size * 100;
        console.log("File is", percent.toFixed(2), "percent loaded");
        progressBarFill.style.width = percent.toFixed(2) + "%";
        progressBarText.textContent = percent.toFixed(2) + "%";
    }); 
 
    // Do something when a file is uploaded:
    siofu.addEventListener("complete", function(event){
        console.log(event.success);
        if (event.success) {
    
        console.log(event.file);
        }
        
    });
    
    
    }

    // clear message input
    msgInput.value = '';
    msgInput.focus() 
}

messageForm.addEventListener("submit", event => {
    event.preventDefault();
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
    if(message.attachment === true) {
        if (message.username === username) {
            var msg = `
            <li class="mchat-msg-self">
            <span id="chat-new">
            <p>Attachment<p>
            <p>Name: ${message.fileName} Sent</p>
            </span>
        </li>
        `
        document.getElementById("progressBar").style.display = "none";
        } else {
            var msg = `
            <li class="mchat-msg-other">
            <span id="chat-new">
            <p><i class="namee">${message.username}</i></p>
            <p>Attachment<p>
            <p>Name: ${message.fileName}</p>
            <p><a href = "https://i2talk-chat.herokuapp.com/attachment/${message.fileName}">Download file</a><p>
            </span>
        </li>
        `
        }
        
    } else if (message.username === username) {
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
  fetch(`${webLink}/api/chatrooms/messages/${roomId}`, {
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
                    if (chatRoomMessages[i].isMessage === 0) {
                        if (chatRoomMessages[i].username === username) { 
                            var msg = `
                        <li class="mchat-msg-self">
                        <span id="chat-new">
                          <p>Attachment</p>
                          <p>Name: ${chatRoomMessages[i].fileName} Sent</p>
                        </span>
                    </li>
                    `
                         } 
                        else {
                                var msg = `
                                <li class="mchat-msg-other">
                                <span id="chat-new">
                                <p><i class="namee">${chatRoomMessages[i].username}</i></p>
                                <p>Attachment</p>
                                <p>Name: ${chatRoomMessages[i].fileName}</p>
                                <p><a href = "${chatRoomMessages[i].filePath}">Download file</a><p>
                                </span>
                            </li>
                            `
                        }
                        
                } else if (chatRoomMessages[i].username === username) {
                        var msg = `
                        <li class="mchat-msg-self">
                        <span id="chat-new">
                        <p><b>${ToTime(chatRoomMessages[i].timePosted)}</b> - ${chatRoomMessages[i].message}<p>
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

function ToTime(newtime) {
    // const date = new Date(newtime);
    const time = moment(newtime).format('h:mm a')
    return time;
}
var t = document.createTextNode(`${roomName} Group Chat`);     // Create a text node
Chatheader.appendChild(t);