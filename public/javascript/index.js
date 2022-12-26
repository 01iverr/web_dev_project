// const url = "https://wiki-shop.onrender.com/categories/";
// window.onload = init;

// function init() {
//     makeCategoriesRequest();
// }

// function makeCategoriesRequest() {
//     let myHeaders = new Headers();
//     myHeaders.append('Accept', 'application/json');

//     let init = {
//         method: "GET",
//         headers: myHeaders
//     }

//     fetch(url, init)
//         .then(response => {
//             if (response.status == 200) {
//                 return response.json();
//             } else {
//                 console.log("[!] Something went wrong [!]");
//             }
//         })
//         .then((data) => {
//             res.render("categories", { 
//                 categories: data 
//             });
//             console.log("[ Rendered categories page. ]")
//         })
//         .catch((err) => {
// 			console.log(err);
// 		});
// }
