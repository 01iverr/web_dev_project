const sourceurl = "https://wiki-shop.onrender.com/";
var subcategories;
var products;

function init() {
    // Get category id from url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let category_id = urlParams.get("categoryId");

    // Fetch Data and load to page
    fetchCategories(category_id);
    fetchSubCategories(category_id);
    fetchProducts(category_id);
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

init();
