const sourceurl = "https://wiki-shop.onrender.com/";
var subcategories;
var products;

function init() {
    // Get category id from url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let category_id = urlParams.get("categoryId");

    // Fetch Data and load to page
    showCartItemsCount();
    fetchCategories(category_id);
    fetchSubCategories(category_id);
    fetchProducts(category_id);
}

/**
 * Get total number of items in user's cart (if logged in), and show on page.
 */
function showCartItemsCount() {
    let destination = document.getElementById('num-items-in-cart');
    let source = document.getElementById('num-items-in-cart-template').innerHTML;
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
            num_items_in_cart: 0,
        });
        destination.innerHTML = html;
        return;
    }

    // User is logged in

    console.log("[ User logged in: getting count of items in cart.. ]");
        
    let data = {
        username: username,
        sessionId: sessionId,
    }
    let status;    

    sendPostRequestCartItemsCount(data) // request number of items in user's cart
    .then(response => {
        status = response.status;
        return response.json();
    })
    .then(data => {
        if (status == "203") {
            let num_items_in_cart = data.size;
            console.log(`[ Data received: ${num_items_in_cart} in ${username}'s cart ]`);

            const html = template({
                num_items_in_cart: num_items_in_cart,
            });
            destination.innerHTML = html;
        }
        else {
            console.log("[ Something went wrong while getting count of items in cart. ]");
        }
        console.log(`[ (${status}) ${data.msg} ]`)
    });

}

function fetchCategories(category_id) {
    let myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

    let init = {
        method: "GET",
        headers: myHeaders
    }

    let destination = document.getElementById('title');

    let source = document.getElementById('title-template').innerHTML;
    let template = Handlebars.compile(source);

    // url to fetch
    const url = sourceurl+"categories/";

    fetch(url, init)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                console.log("[ Something went wrong ]");
            }
        })
        .then((data) => {

            title = data[category_id - 1]["title"];

            const html = template({
                category_title: title,
                category_id: category_id,
                page_title: title,
            });
            destination.innerHTML = html;
            
        })
        .catch((err) => {
			console.log(err);
		});
}

function fetchSubCategories(category_id) {
    let myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

    let init = {
        method: "GET",
        headers: myHeaders
    }

    let destination = document.getElementById('filters');

    let source = document.getElementById('subcategories-template').innerHTML;
    let template = Handlebars.compile(source);

    // url to fetch
    const url = sourceurl+"categories/"+category_id+"/subcategories";

    fetch(url, init)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                console.log("[ Something went wrong ]");
            }
        })
        .then((data) => {
            subcategories = data;

            const html = template({
                subcategories: data,
            });
            destination.innerHTML = html;
            
        })
        .catch((err) => {
			console.log(err);
		});
}

function fetchProducts(category_id) {
    let myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

    let init = {
        method: "GET",
        headers: myHeaders
    }

    let destination = document.getElementById('products');

    let source = document.getElementById('product-template').innerHTML;
    let template = Handlebars.compile(source);

    // url to fetch
    const url = sourceurl+"categories/"+category_id+"/products";

    fetch(url, init)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                console.log("[ Something went wrong ]");
            }
        })
        .then((data) => {
            products = data;

            const html = template({ 
                products: data,
            });
            destination.innerHTML = html;

        })
        .catch((err) => {
			console.log(err);
		});
}

function filterProducts() {
    let destination = document.getElementById('products');

    let source = document.getElementById('product-template').innerHTML;
    let template = Handlebars.compile(source);

    let final_products = [];

    // Find Subcategory to filter for
    let filter_sub = 0;
    for (sub of subcategories){
        if(document.getElementById(sub["title"]).checked) {
            filter_sub = sub["id"];
        }
    }

    // Filter Products
    if(document.getElementById('all').checked) {
        final_products = products;
    } else {
        for (product of products) {
            if (product["subcategory_id"] == filter_sub){
                final_products.push(product);
            }
        }
    }

    const html = template({ 
        products: final_products,
    });
    destination.innerHTML = html;
}

function addToCart(product_id) {
    // Get product data with product id
    let product;
    for (p of products){
        if (p.id == product_id){
            product = p;
        }
    }

    // Get user login data from url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let username = urlParams.get("username");
    let sessionId = urlParams.get("sessionId");

    // Check user is logged in
    if (!username || !sessionId) {
        showMessageAddToCart("Please login to add products to cart.");
        return;
    }

    // Add item to cart
    console.log(`[ User "${username}" with session id "${sessionId}" trying to buy "${product.title}" ]`)
    
    let data = {
        username: username,
        sessionId: sessionId,
        product: product,
    }
    let status;

    sendPostRequestAddToCart(data)
    .then(response => {
        status = response.status;
        return response.json();
    })
    .then(responseMsg => {
        if (status == "202") {
            // Successfully added item to cart
            console.log(`[ Status received: ${status} ]`);
            showMessageAddToCart(`Product "${product.title}" has been added to cart!`);
            showCartItemsCount();
        }
        else {
            console.log("[ Something went wrong ]");
            showMessageAddToCart(`Product "${product.title}" couldn't be added to cart`);
        }
        console.log(`[ ${responseMsg.msg} ]`)
    });
        
}

/**
 * Post request for receiving total number of items in user's cart
 * @param {json} data json including username and session id for user
 */
function sendPostRequestCartItemsCount(data) {
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    data.post_type = "num_items_in_cart";
    let init = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data)
    };
    return fetch(urlPOST, init);
}

/**
 * Post request for adding a new item to user's cart
 * @param {json} data json including username, session id for user and product data
 */
function sendPostRequestAddToCart(data) {
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    data.post_type = "add_to_cart";
    let init = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data)
    };
    return fetch(urlPOST, init);
}

/**
 * Message to show after add to cart button press.
 * @param {String} message message to show
 */
function showMessageAddToCart(message) {
    alert(message);
}

init();
