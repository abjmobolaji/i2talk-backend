var signupForm = document.getElementById('signUpForm');
var errorMessage = document.getElementById("error-signup");
const webLink = "https://i2talk-chat.herokuapp.com";

signupForm.addEventListener('submit', (e) => {
    var sex = document.getElementById('gender').value;
    var phone = document.getElementById('phone-number').value;
    var userLocation = document.getElementById("userLocation").value;
    var password = document.getElementById("password").value;
    var username = document.getElementById("userName").value;
    var fullName = document.getElementById('fullNames').value;
    var email = document.getElementById("mail").value
    console.log(fullName);
    var data = {
        fullName,
        username,
        password,
        email,
        phone,
        sex,
        state: userLocation
    };
    // console.log(JSON.stringify(data));
    fetch(`${webLink}/api/users/signup`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {"Content-type": "application/json; charset=UTF-8"}
      }).then((response) => {
    response.json().then((data) => {
        if (data.error) {
            errorMessage.style.display = "Block";
            errorMessage.innerHTML = data.error;
        } else {
            swal({
                icon: "success",
                title: "Registration Successful",
                button: {
                  text: "Proceed to Login",
                  value: true,
                  visible: true,
                  className: "",
                  closeModal: true,
                },
                // .swal-modal {
                //   background-color: rgba(63,255,106,0.69);
                //   border: 3px solid white;
                // }
              }).then(() => {
                setTimeout(function(){window.location.assign("/login")}, 1000);
              });
        }
    })
})
e.preventDefault();
})