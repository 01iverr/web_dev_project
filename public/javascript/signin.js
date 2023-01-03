const urlPOST = "http://localhost:8080/category.html"
const urlGET = "http://localhost:8080/user/"

window.onload = init;

function init() {
    const form = document.getElementById('signin-form');
    const UsernameInput =  document.getElementById('profile-username');
    const password = document.getElementById('profile-password');

    // On submit button click
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const UsernameValue = UsernameInput.value.trim();
        const passwordValue = password.value.trim();
        console.log("[ Submission button clicked. ]")

        if ( checkInput(UsernameValue)&&checkInput(passwordValue) ) {
            let status = "201";
            let userdata = {
                Username: UsernameValue,
                Password: passwordValue,
            }
            
            sendPostRequest(userdata)
                .then(response => {
                    status = response.status;
                    return response.json();
                })
                .then(responseMsg => {
                    console.log('[ Response Message: ]')
                    console.log(responseMsg);
                    if (status == "202") {
                        // Successful sign in
                        console.log(`[ Status received: ${status} ]`);
                        let sessionId = responseMsg.sessionId;
                        
                        // Pass session id to url as parameter(without reloading page)
                        var url = new URL(window.location.href);
                        url.searchParams.append('sessionId', sessionId);
                        console.log(`[ New url: ${url} ]`)
                        
                        const nextURL = url;
                        const nextTitle = 'Category';
                        const nextState = { additionalInformation: 'Updated the URL with JS' };

                        // create a new entry in the browser's history, without reloading
                        window.history.pushState(nextState, nextTitle, nextURL);
                        // replace the current entry in the browser's history, without reloading
                        window.history.replaceState(nextState, nextTitle, nextURL);
                    }
                    else {
                        console.log("[ Something went wrong ]");
                    }
                    console.log(`[ ${responseMsg.msg} ]`)
                })
                .catch(error => {
                    console.log(`[ Fetch error: ${error} ]`);
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
    let init = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data)
    };
    return fetch(urlPOST, init);
}
