var signInForm = document.getElementById('signin-form');
var errorMessages = document.getElementById("error-login");
const webLink = "https://i2talk-chat.herokuapp.com"

signInForm.addEventListener('submit', (e) => {
    const login = document.getElementById("login").value;
    const password = document.getElementById("_password").value;
    var data = {
        login,
        password
    };
    // console.log(JSON.stringify(data));
    fetch(`${webLink}/api/login`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {"Content-type": "application/json; charset=UTF-8"}
      }).then((response) => {
        if (response.status === 401){
            errorMessages.style.display = "Block";
            errorMessages.innerHTML = `<b>Invalid Credentials</b>`;
        } else {
            response.json().then((data) => {
            localStorage.setItem("token", JSON.stringify(data));
              window.location.assign("/dashboard");
          }) ;
        }
      }).catch(function(error) {
        console.log('Request failed', error)
    });
    e.preventDefault();
  });

  