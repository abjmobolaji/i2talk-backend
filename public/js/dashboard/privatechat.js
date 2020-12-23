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
var siofu = new SocketIOFileUpload(socket);
 
// const chatNo = document.getElementsByClassName("chat-counter")[0]
// const chatImg = document.getElementsByClassName("chat-head-img")[0]
// const chatScreen = document.getElementById("chat-menu");
var Chatheaders = document.getElementById("Chatsheader");
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

// const socket = io();
socket.emit('chats', isender);
const chatID = getPrivateChatID(isender, receiver); 
socket.emit('privateChats', { chatID, isender, receiver });
var t = document.createTextNode(`${ChatScreenName(chatID)}`);     // Create a text node
Chatheaders.appendChild(t);

socket.on('messages', message => {
    // console.log(message)
    outputMessage(message);

    // scroll down
    // chatMessages.scrollTop = chatMessages.scrollHeight;
})



messageForm.addEventListener("submit", event => {
    event.preventDefault();
 
});

document.getElementById("date").addEventListener("submit", event => {
    event.preventDefault();
    
});


function submitFunction(i) {
    if (i==1) {
        var msg = msgInput.value;
        socket.emit('privateChatMessage', { chatID, isender, receiver, msg })
    }
    if (i==2) {
        var msgss = msgInput.value;
        var modalz = document.getElementById("smyModal");
        modalz.style.display = "block";
        var iSchedule = document.getElementById("ischedule-message");
        var modal = document.getElementById("smyModal");
        var userID = userData.data.userID;
        iSchedule.onclick = function() {
        var data = {
            chatID,
            dateTime : document.getElementById("data").value,
            message : msgss,
            isender,
            receiver
        };
        socket.emit('scheduledChatMessage', data)
        swal({
            icon: "success",
            title: "Message Successfully scheduled."
          }).then(() => {  modal.style.display = "none";
          });
    }
            var span = document.getElementsByClassName("sclose")[0];

            modal.style.display = "block";
        
        span.onclick = function() {
            modal.style.display = "none";
        }
        

        window.onclick = function(event) {
            if (event.target == modal) {
            modal.style.display = "none";
            }
        } 

    }
    if (i==3) {
        document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
        let loader = `
                <div class="progress-bar" id="progressBar">
                    <div class="progress-bar-fill">
                        <span class="progress-bar-text">0%</span>
                    </div>
                </div>
        `
    messageScreen.innerHTML += loader;
    document.getElementById("pmessages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        var chatData = {
            chatID,
            isender,
            receiver
    };
    siofu.addEventListener("start", function(event){
        event.file.meta.data = chatData;
        event.file.meta.type = "privateChats";
    });
    // Do something on upload progress:
    siofu.addEventListener("progress", function(event){
        const progressBarFill = document.querySelector("#progressBar > .progress-bar-fill");
    const progressBarText = progressBarFill.querySelector(".progress-bar-text")
        var percent = event.bytesLoaded / event.file.size * 100;
        console.log("File is", percent.toFixed(2), "percent loaded");
        progressBarFill.style.width = percent.toFixed(2) + "%";
        progressBarText.textContent = percent.toFixed(2) + "%";
        // emit event sending to sender
        // socket.emit('chatAttachmentSending', { percent })
        // socket on  animation
        // socket.on('chatAttachmentStatus', (percent) => {
        //     socket.emit('chatAttachmentStatus', { percent }); 
        // })
    }); 
 
    // Do something when a file is uploaded:
    siofu.addEventListener("complete", function(event){
        console.log(event.success);
        // cancel animation in progress
        if (event.success) {
            // socket.on('chatAttachmentStatus', (message) => {
                
            // })
            console.log(event.file);
        }
        // if sucees == true, emit an event and store the message
        // socket.on to chat id (formatted atachment)
        
        // if failed, show a temporary error message by emit faillure
    });
    
    
    }

    // clear message input
    msgInput.value = '';
    msgInput.focus(); 
}


messageForm.addEventListener('keypress', handleKeyPress);
messageForm.addEventListener('keyup', handleKeyUp);


socket.on("typing",  (data) => {
    const{ sender, status }  = data;
    if (!status) {
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
      document.getElementById("pmessages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
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
    if(message.attachment === true) {
        if (message.username === isender) {
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
            <p>Attachment<p>
            <p>Name: ${message.fileName}</p>
            <p><a href = "/attachment/${message.fileName}">Download file</a><p>
            </span>
        </li>
        `
        }
        
    }  else if(message.schedule === true) {
        var msg = `
            <li class="mchat-msg-self">
            <span id="chat-new">
            <p>Scheduled Message<p>
            <p>${message.text}<p>
            <p id="${message.newDate}"></p>
            </span>
        </li>
        `
        countDown(message.newDate)
    } 
    else if (message.username === isender && message.schedule !== true) {
            var msg = `
            <li class="mchat-msg-self">
            <span id="chat-new">
            <p>${message.text}<p>
            </span>
        </li>
        `
    }
    else {
            var msg = `
            <li class="mchat-msg-other">
            <span id="chat-new">
            <p>${message.text}</p>
            </span>
        </li>
        `
    }
    messageScreen.innerHTML += msg;
    document.getElementById("pmessages").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
}


function getChatMessages(token, chatID) {
    fetch(`/api/chats/messages/${chatID}`, {
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
                        if (chatRoomMessages[i].sender === isender) { 
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
                                <p>Attachment</p>
                                <p>Name: ${chatRoomMessages[i].fileName}</p>
                                <p><a href = "${chatRoomMessages[i].filePath}">Download file</a><p>
                                </span>
                            </li>
                            `
                        }
                        
                }  else if (chatRoomMessages[i].sender === isender) {
                          var msg = `
                          <li class="mchat-msg-self">
                          <span id="chat-new">
                          <i onclick="chatOption(this)" data-chat-message="${chatRoomMessages[i].message}" class="fas fa-ellipsis-h"></i>
                          <p>${chatRoomMessages[i].message}</p>
                          </span>
                      </li>
                      `
                  } 
                   else {
                          var msg = `
                          <li class="mchat-msg-other">
                          <span id="chat-new">
                          <i id="myBtn" onclick="chatOption(this)" data-chat-message="${chatRoomMessages[i].message}" class="fas fa-ellipsis-h"></i>
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

  
function chatOption(chatMessage) {
    var userData = JSON.parse(localStorage.getItem("token"));
    const chatMessagez = chatMessage.getAttribute("data-chat-message");
    var iDairy = document.getElementById("iDairy-message");
    var modal = document.getElementById("myModal");
    var content = document.getElementsByClassName("modal-content")[0];
    iDairy.onclick = function() {
        var data = {
            message : chatMessagez
        };
        fetch('/api/idairy/add', {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Authorization': `Bearer ${token}`
            }
          }).then((response) => {
            if (response.status === 401){
                
            } else {
                response.json().then((data) => {
                    swal({
                        icon: "success",
                        title: "Message added to iDairy Successfully"
                      }).then(() => {  modal.style.display = "none";
                      });
                     
              }) ;
            }
          }).catch(function(error) {
            console.log('Request failed', error)
        });
    }
    

    var span = document.getElementsByClassName("close")[0];

      modal.style.display = "block";
    
    span.onclick = function() {
      modal.style.display = "none";
    }
    
  
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    } 
};

// const button = document.getElementById("scd-btn");
// button.addEventListener("click", (e) => {

//     var msgss = msgInput.value;
//     alert(msgss)
//     e.stopPropagation();
// })

var defaults = {
	calendarWeeks: true,
	showClear: true,
	showClose: true,
	allowInputToggle: true,
	useCurrent: false,
	ignoreReadonly: true,
	minDate: new Date(),
	toolbarPlacement: 'top',
	locale: 'nl',
	icons: {
		time: 'fa fa-clock-o',
		date: 'fa fa-calendar',
		up: 'fa fa-angle-up',
		down: 'fa fa-angle-down',
		previous: 'fa fa-angle-left',
		next: 'fa fa-angle-right',
		today: 'fa fa-dot-circle-o',
		clear: 'fa fa-trash',
		close: 'fa fa-times'
	}
};

$(function() {
	var optionsDatetime = $.extend({}, defaults, {format:'DD-MM-YYYY HH:mm:ss'});
	$('.datetimepicker').datetimepicker(optionsDatetime);
});

function countDown(newDate) {
    // Set the date we're counting down to
var countDownDate = new Date(newDate).getTime();

// Update the count down every 1 second
var x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();
    
  // Find the distance between now and the count down date
  var distance = countDownDate - now;
    
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
  // Output the result in an element with id="demo"
  document.getElementById(`${newDate}`).innerHTML = days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";
    
  // If the count down is over, write some text 
  if (distance < 0) {
    clearInterval(x);
    document.getElementById(`${newDate}`).innerHTML = "Message Sent Sucessfully";
  }
}, 1000);
}