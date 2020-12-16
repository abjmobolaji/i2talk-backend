var userData = JSON.parse(localStorage.getItem("token"));
var token = userData.accessToken;
var isender = titleCase(userData.data.username);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const receiver = titleCase(urlParams.get('username'));
var messageScreen = document.getElementById("pmessages");
var messageForm = document.getElementById("pmessageForm");
var msgInput = document.getElementById("pmsg-input");
const msgBtn = document.getElementById("pmsg-btn");
// const chatNo = document.getElementsByClassName("chat-counter")[0]
// const chatImg = document.getElementsByClassName("chat-head-img")[0]
// const chatScreen = document.getElementById("chat-menu");
var Chatheaders = document.getElementById("Chatsheader")

// console.log(getPrivateChatID(isender, receiver));


String.prototype.replaceAt = function(index, character) {
    return (
      this.substr(0, index) + character + this.substr(index + character.length)
    );
  };
  
function titleCase(str) {
    const newTitle = str.split(" ");
    const updatedTitle = [];
    for (var st in newTitle) {
      updatedTitle[st] = newTitle[st]
        .toLowerCase()
        // .replaceAt(0, newTitle[st].charAt(0).toUpperCase());
}
    return updatedTitle.join(" ");
}
  

function getPrivateChatID(isender, receiver) {
    const chatOwner = [isender, receiver];
    chatOwner.sort((a, b) => a.localeCompare(b));
    return  `${chatOwner[0]}_${chatOwner[1]}`
}

function ChatScreenName(chatroomiid) {
  const a = chatroomiid.replace(isender, "")
  const fresult = a.replace("_", "")
  return fresult;
}

const socket = io();

const chatID = getPrivateChatID(isender, receiver); 
socket.emit('privateChats', { chatID, isender, receiver });
var t = document.createTextNode(`${ChatScreenName(chatID)}`);     // Create a text node
Chatheaders.appendChild(t);
socket.on('messages', message => {
    console.log(message)
    outputMessage(message);

    // scroll down
    // chatMessages.scrollTop = chatMessages.scrollHeight;
})



messageForm.addEventListener("submit", event => {
    event.preventDefault();
    var msg = msgInput.value;
    socket.emit('privateChatMessage', { chatID, isender, receiver, msg })

    // clear message input
    msgInput.value = '';
    msgInput.focus(); 
});

messageForm.addEventListener('keypress', handleKeyPress);
messageForm.addEventListener('keyup', handleKeyUp);


socket.on("typing",  (data) => {
    const{ sender, status }  = data;
    if (!status) {
        // document.getElementById("messs").innerHTML = "";
        document.getElementById("typing").innerHTML = "";
    }
    else {
        if (sender != isender) {
        var msgs = `
          <li class="mchat-msg-other">
          <span id="chat-new">
          <p><b>${sender}</b> is typing<p>
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
        const status = true;
        socket.emit("Ptyping", {chatID, status, isender});
    }
    // when the user has stopped pressing on keys, set the timeout
    // if the user presses on keys before the timeout is reached, then this timeout is canceled
    function handleKeyUp(e) {
        window.clearTimeout(timer); // prevent errant multiple timeouts from being generated
        timer = window.setTimeout(() => {
            const status = false;
            socket.emit("Ptyping", {chatID, status, isender});
        }, timeoutVal);
    }

function outputMessage(message) {
    if (message.username === isender) {
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
    document.getElementById("pmessages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
}


function getChatMessages(token, chatID) {
    fetch(`http://localhost:3000/api/chats/messages/${chatID}`, {
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
                      if (chatRoomMessages[i].sender === isender) {
                          var msg = `
                          <li class="mchat-msg-self">
                          <span id="chat-new">
                          <p>${chatRoomMessages[i].message}<p>
                          </span>
                      </li>
                      `
                  } else {
                          var msg = `
                          <li class="mchat-msg-other">
                          <span id="chat-new">
                          <p><i class="namee">${chatRoomMessages[i].sender}: </i> ${chatRoomMessages[i].message}</p>
                          </span>
                      </li>
                      `
                  }
                  messageScreen.innerHTML += msg;
                  }
                  document.getElementById("pmessages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
                }
                
                
          })
          } else {
            
          }
        }).catch(function(error) {
          console.log('Request failed', error)
      });
  }
  getChatMessages(token, chatID);