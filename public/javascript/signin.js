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

        let success_login; // boolean: successful/failed login

        if ( checkInput(UsernameValue)&&checkInput(passwordValue) ) {
            let status;
            let userdata = {
                Username: UsernameValue,
                Password: passwordValue,
            }

            sendPostRequestLogin(userdata)
            .then(response => {
                status = response.status;
                return response.json();
            })
            .then(responseMsg => {
                console.log('[ Response Message: ]')
                console.log(responseMsg);
                if (status == "200") {
                    // Successful sign in
                    console.log(`[ Status received: ${status} ]`);
                    let sessionId = responseMsg.sessionId;
                    let username = responseMsg.username;

                    // Pass username and session id to url as parameters (without reloading page)
                    var url = new URL(window.location.href);
                    url.searchParams.set('username', username);
                    url.searchParams.set('sessionId', sessionId);
                    console.log(`[ New url: ${url} ]`)

                    const nextURL = url;
                    const nextTitle = 'Category';
                    const nextState = { additionalInformation: 'Updated the URL with JS' };

                    // create a new entry in the browser's history, without reloading
                    window.history.pushState(nextState, nextTitle, nextURL);
                    // replace the current entry in the browser's history, without reloading
                    window.history.replaceState(nextState, nextTitle, nextURL);

                    success_login = true;

                    // update count of items in cart
                    console.log("[ Updating count of items in cart for user with data: ]");
                    let data = {
                        username: username,
                        sessionId: sessionId,
                    };
                    console.log(data);

                    showCartItemsCount(data); // update items count in cart, to show on page
                }
                else {
                    console.log("[ Something went wrong ]");
                    success_login = false;
                }
                console.log(`[ ${responseMsg.msg} ]`)

                // Show message on screen (Successul/Failed login)
                showMessage(success_login);

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

function sendPostRequestLogin(data) {
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    data.post_type = "login";
    let init = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data)
    };
    return fetch(urlPOST, init);
}

function showMessage(success) {
    let destination = document.getElementById('login-message');

    let source = document.getElementById('login-message-template').innerHTML;
    let template = Handlebars.compile(source);

    let login_message;
    if (success) {
        login_message = "Successful login!"
    } else {
        login_message = "Failed login!"
    }

    const html = template({
        login_attempt: true,
        login_message: login_message,
    });
    destination.innerHTML = html;
}
