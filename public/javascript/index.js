const sourceurl = "https://wiki-shop.onrender.com/";

function fetchCategories() {
    let myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

    let init = {
        method: "GET",
        headers: myHeaders
    }

    let destination = document.getElementById('categories-destination');

    let source = document.getElementById('categories-template').innerHTML;
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

            const html = template({
                categories: data,
            });
            destination.innerHTML = html;
            
        })
        .catch((err) => {
			console.log(err);
		});
}

fetchCategories();
