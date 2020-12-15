var userData = JSON.parse(localStorage.getItem("token"))
var token = userData.accessToken

function getChatRooms(token) {
  fetch(`http://localhost:3000/api/chatrooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
      }
      }).then((response) => {
        if (response.status == 200){
          response.json().then((data) => {
              console.log(data.data)
              var chatRoom = data.data;
              for (i=0; i<= chatRoom.length; i++) {
                if(chatRoom[i]!=null || chatRoom[i]!=undefined )
                {
                var chatRooms = ""
                chatRooms += `
                        <div class="chatrooms-items">
                        <span style="font-size:35px; color:#110E4C;">
                        <i class="fas fa-hashtag"></i>
                        </span>
                        <div>
                        <h3 onclick="enterChatroom(this)" data-chatroom-id="${chatRoom[i].ID}" data-chatroom-name="${chatRoom[i].chatRoomName}">${chatRoom[i].chatRoomName}</h3>
                        <p>${chatRoom[i].chatRoomDesc}</p>
                        </div>
                        </div>
                `
                document.getElementById("chatrooms-page").innerHTML += `${chatRooms}`;
                }
              }
              
              
        })
        } else {
          
        }
      }).catch(function(error) {
        console.log('Request failed', error)
    });
}
getChatRooms(token);

function enterChatroom(chatroomName) {
  const ChatroomName = chatroomName.getAttribute("data-chatroom-name");
  const chatId = chatroomName.getAttribute("data-chatroom-id");
  let url = new URL(`http://localhost:3000/chat-room?id=${chatId}`);
  url.searchParams.set('name', ChatroomName)
  window.location.assign(url)
}