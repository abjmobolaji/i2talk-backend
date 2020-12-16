var userData = JSON.parse(localStorage.getItem("token"));
var token = userData.accessToken;
const searchForm = document.getElementById("iSearch-form");
const searchGeo = document.getElementById("isearch-geolocation");

searchForm.addEventListener("submit", function () {
    event.preventDefault();
    document.getElementById("iSearch-result").innerHTML = `<img src="/img/isearch-loader.gif"><h3>Searching for users...</h3>`
    foundLocation = (document.getElementById("iSearchInput").value).toLowerCase();
    iSearchResultNo ="";
    iSearchResult="";
    const data = {
        "location" : foundLocation,
        "kilometer" : 50000
    };
    timeOut = setTimeout(function() { 
        fetch(`http://localhost:3000/api/isearch/location`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Authorization': `Bearer ${token}`
            }
      }).then((response) => {
        if (response.status == 200){
          response.json().then((data) => {
            const result = data.data
            console.log(result)
            var noOfUsers = result.length;
                  if (result == null || result == undefined || result =="" || response.status == 404){
                      iSearchResult+= 
                      `<h3>No User Found in ${foundLocation}`
                      document.getElementById("iSearch-result").innerHTML = `${iSearchResult}`;
                  }
                  else {
                      if (noOfUsers === 1) {
                          iSearchResultNo+= 
                      `<h3>${noOfUsers} User Found`
                      } else {
                          iSearchResultNo+= 
                          `<h3>${noOfUsers} Users Found`
                      }
                      document.getElementById("iSearch-result").innerHTML = `${iSearchResultNo}`;
                      
                      iSearchResult="";
                        for( let i=0; i<noOfUsers; i++) {
                            if(result[i]!=null || result[i]!=undefined )
                            {
                                iSearchResult+= `
                                <div class="iSearchResults"> 
                                    <div class="iSearchInfo">
                                        <img src= "/img/dummy-profile.jpg">
                                    </div>
                                    <div class="iSearch-container">
                                        <h2>${result[i].fullName}</h2><br>
                                        <p>${result[i].state}</p>
                                    </div>
                                    <button class="btn pos">View Profile</button> &nbsp; <button onclick="newChat(this)" data-username="${result[i].username}" class="btn">Message</button>
                                </div>
                                `;
                            }
                        }
                        document.getElementById("iSearch-result").innerHTML += `${iSearchResult}`;
                    
                  }
              
        })
        } else {
            if (response.status == 404){
                iSearchResult+= 
                `<h3>No User Found in ${foundLocation}`
                document.getElementById("iSearch-result").innerHTML = `${iSearchResult}`;
            }
        }
      }).catch(function(error) {
        console.log('Request failed', error)
    });
   
     }, 5000);
});

searchGeo.addEventListener("click", function() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sortResults, errorMessage);
        swal("Allow Location Access to Find Nearby", {
            buttons: false,
            timer: 3000,
          });
    } else {
        alert("Sorry, your browser does not support HTML5 geolocation.");
    }
});

function errorMessage(error) {
    if(error.code == 1) {
        swal("You denied Location Access", "Allow Location Access to Find Nearby Users", {
            buttons: false,
            timer: 5000,
            icon: "error",
          });
    } else if(error.code == 2) {
        alert("The network is down or the positioning service can't be reached.");
    } else if(error.code == 3) {
        alert("The attempt timed out before it could get the location data.");
    } else {
        alert("Geolocation failed due to unknown error.");
    }
}

function sortResults(position) {
    document.getElementById("iSearch-result").innerHTML = `<img src="/img/isearch-loader.gif"><h3>Searching for users...</h3>`
    iSearchResultNo ="";
    iSearchResult="";
    const data = {
        "latitude" : position.coords.latitude,
        "longitude": position.coords.longitude,
        "kilometer" : 50000
    };
    timeOut = setTimeout(function() { 
        fetch(`http://localhost:3000/api/isearch/geolocation`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Authorization': `Bearer ${token}`
            }
      }).then((response) => {
        if (response.status == 200){
          response.json().then((data) => {
            const result = data.data
            console.log(result)
            var noOfUsers = result.length;
                  if (result == null || result == undefined || result =="" || response.status == 404){
                      iSearchResult+= 
                      `<h3>No User Found`
                      document.getElementById("iSearch-result").innerHTML = `${iSearchResult}`;
                  }
                  else {
                      if (noOfUsers === 1) {
                          iSearchResultNo+= 
                      `<h3>${noOfUsers} User Found`
                      } else {
                          iSearchResultNo+= 
                          `<h3>${noOfUsers} Users Found`
                      }
                      document.getElementById("iSearch-result").innerHTML = `${iSearchResultNo}`;
                      
                      iSearchResult="";
                        for( let i=0; i<noOfUsers; i++) {
                            if(result[i]!=null || result[i]!=undefined )
                            {
                                iSearchResult+= `
                                <div class="iSearchResults"> 
                                    <div class="iSearchInfo">
                                        <img src= "/img/dummy-profile.jpg">
                                    </div>
                                    <div class="iSearch-container">
                                        <h2>${result[i].fullName}</h2><br>
                                        <p>${result[i].state}</p>
                                    </div>
                                    <button class="btn pos">View Profile</button> &nbsp; <button onclick="newChat(this)" data-username="${result[i].username}" class="btn">Message</button>
                                </div>
                                `;
                            }
                        }
                        document.getElementById("iSearch-result").innerHTML += `${iSearchResult}`;
                    
                  }
              
        })
        } else {
            if (response.status == 404){
                iSearchResult+= 
                `<h3>No User Found`
                document.getElementById("iSearch-result").innerHTML = `${iSearchResult}`;
            }
        }
      }).catch(function(error) {
        console.log('Request failed', error)
    });
   
     }, 5000);
 
};

function newChat(username) {
    username = username.getAttribute("data-username");
    let url = new URL(`http://localhost:3000/privatechat?username=${username}`);
    window.location.assign(url)
    // setTimeout(function(){ window.location.assign(`PrivateChat.html`) }, 500);
}