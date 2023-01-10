const urlPOST = "http://localhost:8080/cart.html"

window.onload = init;

function init() {
  let destination = document.getElementById('products-cart');
  let source = document.getElementById('prodcat-template').innerHTML;
  let template = Handlebars.compile(source);

  // Get user login data from url
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let username = urlParams.get("username");
  let sessionId = urlParams.get("sessionId");

  // Check user is logged in
  if (!username || !sessionId) {
    console.log("[ User not logged in: can't count items in cart ]");
    // User isn't logged in, 0 items in cart.
    const html = template({
      login: false
    });
    destination.innerHTML = html;
    return;
  }

  // User is logged in
  console.log("[ Getting items from cart.. ]");

  let data = {
    username: username,
    sessionId: sessionId,
  }
  let status;

  sendPostRequestCart(data) // request number of items in user's cart
    .then(response => {
      status = response.status;
      return response.json();
    })
    .then(data => {
      if (status == "200") {
        let cart = data.cart;
        console.log(`[ Data received: ${cart} in ${username}'s cart ]`);
        let detail= ["Name","Cost","Quantity"];
        let products = cart["cartItems"];
        let totalcost= cart["totalCost"];
        const html = template({
          login: true,
          details : detail,
          products : products,
          totalcost: totalcost
        });
        destination.innerHTML = html;
      } else {
        console.log("[ Something went wrong while getting items in cart. ]");
      }
      console.log(`[ (${status}) ${data.msg} ]`)
    });
}

function sendPostRequestCart(data) {
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
