const urlPOST = "http://localhost:8080/index.html"
const urlGET = "http://localhost:8080/user/"

window.onload = init;

function init() {
    const form = document.getElementById('signin-form');
    const UsernameInput =  document.getElementById('profile-username');
    const password = document.getElementById('profile-password');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const UsernameValue = UsernameInput.value.trim();
        const passwordValue = password.value.trim();
        console.log("Submission button clicked!")

        if ( checkInput(UsernameValue)&&checkInput(passwordValue) ) {
            let status = "201";
            let userdata = {
                Username: UsernameValue,
                Password: passwordValue,
            }
            console.log(userdata);
            sendPostRequest(userdata)
                .then(response => {
                    console.log("--- after sendPostRequest");
                    status = response.status;
                    return response.json();
                })
                .then(responseMsg => {
                    console.log("--- after then");
                    console.log(responseMsg)
                    console.log(status)
                    //showAlertBox();
                    if (status == "202") {
                        //Success
                    }
                    else {
                        console.log("Something went wrong!!");
                    }
                    console.log(responseMsg.msg)
                })
                .catch(error => {
                    console.log("Fetch error:", error);
                });
        }
    });
}



function checkInput(input) {
    let flag = true;
    if(input===''){
      showBox("Complete this field.")
      flag = false;
    }
    return flag;
}

function sendPostRequest(data) {
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    console.log(data);
    console.log(typeof data);
    let init = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data)
    };
    return fetch(urlPOST, init);
}
