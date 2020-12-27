var userData = JSON.parse(localStorage.getItem("token"))
var token = userData.accessToken

		//DISPLAY LOADER BESIDE THE SEARCH BUTTON BEFORE RESULTS SHOW UP
		function displayLoader(){
			document.getElementById("idiary-loader").style.display="inline-block"
			setTimeout(searchIncludes,1000)
		}

		//DISPLAY LOADER BESIDE THE BACK BUTTON BEFORE ALL SAVED NOTES SHOW UP
		function displayBackLoader(){
			document.getElementById("idiary-back-loader").style.display="inline-block"
			setTimeout(back,1000)
		}

		//TO SEARCH FOR A SAVED NOTE
		function searchIncludes(){
			
		input= document.getElementById("searchInput").value
	
		input=input.toLowerCase()//CONVERTS THE SEARCH INPUT TO LOWER CASE
		fetch(`${webLink}/api/idairy/search/${input}`, {
			headers: {
			  'Authorization': `Bearer ${token}`
		  }
		  }).then((response) => {
			if (response.status == 200){
			  response.json().then((data) => {
				  var iDairy = data.data;
				  console.log(iDairy);
				  document.getElementById("records").style.display="block"
				document.getElementById("back-btn").style.display="block"
				document.getElementById("top").style.display="none"
				document.getElementById("top-heading").style.display="none"
			
				if(iDairy==null||iDairy==undefined){
					document.getElementById("records").innerHTML=`<b> No notes found</b>`
				}
				else{
					displaySearchedMessages(iDairy)
					if(iDairy.length==1){
					document.getElementById("records").innerHTML=`<b> 1 note found</b>`
					}
					else{
					document.getElementById("records").innerHTML=`<b>${iDairy.length} notes found</b>`
					}
				}
			})
			} else {
			  
			}
		  }).catch(function(error) {
			console.log('Request failed', error)
		});
		//FILTERS FOR MESSAGES THAT INCLUDE THE SEARCH PARAMETER
		}
	
	
		//TO GO BACK TO THE MAIN DISPLAY OF ALL SAVED MESSAGES
		function back(){
		location.reload()
		}
	
		//TO SHOW THE ADD NEW MESSAGE FORM
		function addNewMessage(){
		document.getElementById("overlay").style.display="block"
		document.getElementById("addNew").style.display="inline-block"
		document.getElementById("top").style.display="none"
		document.getElementById("messageInput").value=""
		}

		//TO DISPLAY ALL SAVED NOTES PLUS NEWLY ADDED NOTE
		function displayAddedMessage(){
		document.getElementById("overlay").style.display="none"
		document.getElementById("top").style.display="block"
		document.getElementById("addNew").style.display="none"
		todaysDate= new Date()//TO GET THE TIME STAMP FOR ALL MESSAGES
	
		newMessage={
			time : todaysDate,
			message: document.getElementById("messageInput").value
		}

		db.collection("users").where("userName", "==", logged).get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				docId = doc.id
		});
		
		db.collection("users").doc(docId).set({
			iDairy: firebase.firestore.FieldValue.arrayUnion(newMessage)
		}, { merge: true })
		  .then(() => {
			console.log("Document added");
			displayMessages()
		});
		});
		}
	
		//FUNCTION TO DISPLAY EDIT MESSAGE FORM
		function showEditMessageForm(x){
		document.getElementById("overlay").style.display="block"	
		document.getElementById("editNew").style.display="block"
		document.getElementById("top").style.display="none"
	
		//SHOWS USER DETAILS AS VALUES TO BE EDITED
		db.collection("users").where("userName", "==", logged).get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				docId = doc.id
				console.log(doc.data())
				if (doc.exists) {
					db.collection("users").doc(docId).get()
					  .then(() => {
						document.getElementById("messageId").value= x
						document.getElementById("editMessageInput").value= doc.data().iDairy[x].message 
				});}
		});})}
	
	
		//FUNCTION FOR EDITING USERS
		function displayEditedMessage(x){
		document.getElementById("overlay").style.display="none"
		document.getElementById("top").style.display="block"
		document.getElementById("editNew").style.display="none"
	
		todaysDate= new Date()//TO GET THE TIME STAMP FOR ALL MESSAGES
		messageId= document.getElementById("messageId").value
	
		// editedMessage= {
		// time: "Last edited on " + todaysDate, 
		// message: document.getElementById("editMessageInput").value
		// }
		
		db.collection("users").where("userName", "==", logged).get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				docId = doc.id
				console.log(doc.data())
				const {message} = doc.data();
				if (doc.exists) {
					db.collection("users").doc(docId).update({

						// [`iDairy.${0}`]: { 
						// 	time: "Last edited on " + todaysDate, 
						// 	message: document.getElementById("editMessageInput").value
						// }
					
					"iDairy" : [ 
							{
								time: todaysDate, 
								message: document.getElementById("editMessageInput").value
							}
						]
					})
					  .then(() => {
						swal("GREAT!", "You have successfully edited this note!", "success");
						displayMessages()
					});
				  }

				
		})});
		}
	
	
		//FUNCTION FOR DELETING USERS
		function deleteMessages(x){
			swal({
				title: "Are you sure?",
				text: "Once deleted, you will not be able to recover this note!",
				icon: "warning",
				buttons: true,
				dangerMode: true,
				})

				.then((willDelete) => {
				if (willDelete) {
					db.collection("users").where("userName", "==", logged).get().then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							docId = doc.id
							console.log(doc.data())
							const {userName, location} = doc.data();
							if (doc.exists) {
								db.collection("users").doc(docId).update({
									"iDairy" : firebase.firestore.FieldValue.arrayRemove(doc.data().iDairy[x])
								})
								  .then(() => {
									
									swal(" This note has been deleted!", {
										icon: "success",
										});
									console.log("Document deleted");
									displayMessages()
								});
							  }
		
							displayMessages()
					});
					});

				} 

				else {
					swal("This note is safe!");
					displayMessages()
				}
				});

		}
	
	
		function displaySearchedMessages(iDairy){
		content=""
		for (i=0; i<= iDairy.length; i++) {
			if(iDairy[i]!=null || iDairy[i]!=undefined )
			{
					content+=`<div id="messageContainer">
						<sup>${ToTime(iDairy[x].timeCreated)}</sup><br>
						<p> ${iDairy[x].message}</p><br>
						</div>`
				
				document.getElementById("messages").innerHTML= content
			}	
		  }
		
		}
	
	
		
		function displayMessages(){

			fetch(`${webLink}/api/idairy/`, {
          headers: {
            'Authorization': `Bearer ${token}`
        }
        }).then((response) => {
          if (response.status == 200){
            response.json().then((data) => {
				var iDairy = data.data;
				console.log(iDairy);
                for (i=0; i<= iDairy.length; i++) {
                  if(iDairy[i]!=null || iDairy[i]!=undefined )
                  {
					content=""
				content+=`
				<div id="messageContainer">
				<sup>${ToTime(iDairy[i].timeCreated)}</sup><br>
				<p> ${iDairy[i].message}</p><br>
				<div id="buttons">
					<span style="font-size:20px; color:#110E4C;" id="edit-icon" onclick="showEditMessageForm(${i})" align="right">
					<i class="far fa-edit"></i>
					</span>
	
					<span style="font-size:20px; color:#110E4C;" id="delete-icon" onclick="deleteMessages(${i})">
					<i class="far fa-trash-alt"></i>
					</span>
				</div>
            </div>`
            document.getElementById("messages").innerHTML+= content
                  }
                  
                }
          })
          } else {
            
          }
        }).catch(function(error) {
          console.log('Request failed', error)
      });
		
		
			
		}
	
		displayMessages()