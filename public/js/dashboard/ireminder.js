const ireminderForm = document.getElementById("ireminderForm");
const ireminder_textspace = document.getElementById("ireminder-textspace");
const ireminderDesc = document.getElementById("ireminderDesc");
const ireminderTitle = document.getElementById("ireminderTitle");
const ireminder_date = document.getElementById("datetime");
var userData = JSON.parse(localStorage.getItem("token"));
var token = userData.accessToken;
var userID = userData.data.userID;
var username = userData.data.username;
var isender = titleCase(userData.data.username);

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

socket.emit('chats', isender);
console.log(isender)
    ireminderForm.addEventListener("submit", (e) => {
        e.preventDefault();
    
        var getDate = moment(ireminder_date.value, "DD-MM-YYYY h:mm a");
        var newDate = getDate.toISOString();
        var date = moment(newDate).format('YYYY-MM-DD H:mm:ss');
        
        var emitData = {
            title : ireminderTitle.value,
            message : ireminderDesc.value,
            timeCompleted : newDate,
            creator : isender
        };

        var data = {
            title : ireminderTitle.value,
            message : ireminderDesc.value,
            timeCompleted : date
        };
        socket.emit('reminder', emitData)
        const display = ireminderTitle.value + ireminderDesc.value + "----->"+ ireminder_date.value;
        ireminder_textspace.innerHTML = display;
        fetch(`${webLink}/api/ireminder/add`, {
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
                      }).then(() => {  
                        
                      });
                     
              }) ;
            }
          }).catch(function(error) {
            console.log('Request failed', error)
        });

        ireminderTitle.value = "";
        ireminderDesc.value = "";
        ireminder_date.value = "";

    });


    $(function () {
		$('#datetimepicker1').datetimepicker({
			format: 'DD-MM-YYYY LT'
		});
		$('#datetimepicker2').datetimepicker({
			format: 'DD-MM-YYYY'
		});
		$('#datetimepicker3').datetimepicker({
			format: 'LT'
		});
		$('#datetimepicker3').datetimepicker({
			format: 'LT'
		});
    });

    socket.on('reminderNotification', details => {
        console.log(details.message, details.title)
       reminder(details);
    })

    function reminder(details) {
        opts = ({
            position:'place_top_center',
            css:'light',
            timeOut:12000,
         //    placeAfter:false,
            animateIn:'fx_animate_slideInRight',
            animateOut:'fx_animate_slideOutRight',
            delay:000,
            dismiss:false
         })
     // })

    
   fx.toast.success({
       title:`${details.title}`,
       body:`${details.message}`,
       opt:opts
   })    
    }