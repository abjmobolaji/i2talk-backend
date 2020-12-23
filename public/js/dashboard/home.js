var userData = JSON.parse(localStorage.getItem("token"))
var userID = userData.data.userID 
var token = userData.accessToken
const webLink = "https://i2talk.live";

function getUserDetails(token, id) {
  fetch(`${webLink}/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
      }
      }).then((response) => {
        if (response.status == 200){
          response.json().then((data) => {
            console.log(data)
            profile = `<div class="side-profile-img">
            <img src="/img/connect.jpg">
            </div>
            <p>@${data.username}</p>
            `;
            document.getElementById("profile").innerHTML = profile; 
            
            document.getElementById("menu-profile").innerHTML = profile; 
            
            profileBox = `<h3><a href="/profile">${data.fullName}</a></h3>`;
            document.getElementById("profile-box").innerHTML = profileBox; 
          }) ;
        } else {
          let url = new URL(`${webLink}/login`);
          window.location.assign(url)
        }
      }).catch(function(error) {
        console.log('Request failed', error)
    });
}
getUserDetails(token, userID);
  
  // Declaration of variables
  const userChatMenu = document.getElementById("user-chat-menu");
  const userSideBar = document.getElementById("user-side-bar");
  const userMessageContainer = document.getElementById("user-message-container");
  
  // chat menu functions
  function showSideBar(show, hide) {
      let a = document.getElementById(show);
      let b = document.getElementById(hide);
      if (a.style.display === "none" && b.style.display === "flex") {
          a.style.display = "flex";
          b.style.display = "none";
      } else {
          a.style.display = "none";
          b.style.display = "flex";
      }
      
  }
  
  function backToMenu(show, hide){
    let x = document.getElementById(show);
    let y = document.getElementById(hide);
    if(show === 'user-chat-menu') {
      x.classList.add('chat-menu-back-arrow');
      // x.style.width = "100%";
      y.classList.add('mobile-direct-msg');
    }
  }
  
  
  
  
  
  
  