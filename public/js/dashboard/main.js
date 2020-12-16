var userData = JSON.parse(localStorage.getItem("token"));
var token = userData.accessToken;
var isender = titleCase(userData.data.username);
const chatNo = document.getElementsByClassName("chat-counter")[0]
const chatImg = document.getElementsByClassName("chat-head-img")[0]
const chatScreen = document.getElementById("chat-menu");

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

function ChatScreenName(chatroomiid) {
    const a = chatroomiid.replace(isender, "")
    const fresult = a.replace("_", "")
    return fresult;
}

function getChatUserMessages(token, isender) {
    fetch(`http://localhost:3000/api/chats/${isender}`, {
          headers: {
            'Authorization': `Bearer ${token}`
        }
        }).then((response) => {
          if (response.status == 200){
            response.json().then((data) => {
                console.log(data.data)
                var chatMessages = data.data;
                var s = document.createTextNode(`${chatMessages.length}`); 
    chatNo.innerHTML=""    // Create a text node
    chatNo.appendChild(s);
    if (chatMessages.length < 1) {
      chatNo.style.display = "none";
      chatScreen.innerHTML=""
      chatScreen.innerHTML+= `
      <div id="chat-center">
      <h2>No Conversations yet!</h2>
      <h4>Click <a href ="/isearch">here</a> to search for users and start chatting</h4>
      </div>
      `
    } else {
      chatScreen.innerHTML=""
          for (i=0; i<chatMessages.length; i++) {
            // const dP = getChatDp(ChatScreenName(data[i].chatID))
            latest=""
          latest += `
          <div class="chat-box">
            <div class="chat-box-col1">
              <div class="chat-box-img">
                <img src="/img/dummy-profile.jpg">
              </div>
            </div>
            <div class="chat-box-col2">
              <h4 onclick="newChat(this)" data-username="${ChatScreenName(chatMessages[i].chatID)}">${ChatScreenName(chatMessages[i].chatID)}</h4> 
              <span class="chat-counter">1</span>
              <p>${chatMessages[i].lastMessage}</p>
              <h6>${chatMessages[i].updatedAt}</h6>
            </div>
          </div>
        `
      chatScreen.innerHTML += latest;
}}
                
          })
          } else {
            
          }
        }).catch(function(error) {
          console.log('Request failed', error)
      });
  }
getChatUserMessages(token, isender);

function ToTime(newtime) {
    const milliseconds = newtime.seconds * 1000;
    const date = new Date(milliseconds);
    const time = date.toLocaleString();
    return time;
}

function newChat(username) {
    username = username.getAttribute("data-username");
    let url = new URL(`http://localhost:3000/privatechat?username=${username}`);
    window.location.assign(url)
    // setTimeout(function(){ window.location.assign(`PrivateChat.html`) }, 500);
}