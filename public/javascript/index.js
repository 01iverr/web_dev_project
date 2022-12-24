const url = "https://wiki-shop.onrender.com/categories/";
window.onload = init;
var templates={};
var categorieslength;

function init() {
  var categ_div = document.querySelector('#categorieslist');
  makeCategoriesRequest(url, categ_div);

}

function makeCategoriesRequest(url, div) {
  let myHeaders = new Headers();
  myHeaders.append('Access-Control-Allow-Origin' , '*');
  myHeaders.append('Accept', 'application/json');

  let init = {
    method: "GET",
    headers: myHeaders
  }

  fetch(url, init)
    .then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        console.log(">!< Looks like something went wrong :/ >!<");
      }
    })

    .then(data => {
      categorieslength = Object.keys(data).length;
      let categoryData = {
        "categories": [],
        "subcategories": []
      }
      for (category of data) {
        let categoryItem = {
          "id": category.id,
          "title": category.title,
          "img_url": category.img_url,
        }
        let subdata = makeCategoriesRequest(url + category.id + "/subcategories");
        categoryData.categories.push(categoryItem);
        categoryData.subcategories.push(subdata);

      }
      let ctgrContent = templates.categories(categoryData);
      div.innerHTML = ctgrContent;
              console.log(categoryData);
    })
    .catch(error => {
      console.log(">!< Fetch error >!<", error);
    })
}

function makeSubCategoriesRequest(url) {
  let categoryData;
  let myHeaders = new Headers();
  myHeaders.append('Accept', 'application/json');
  myHeaders.append('Access-Control-Allow-Origin' , '*');
  let init = {
    method: "GET",
    headers: myHeaders
  }
  fetch(url, init)
    .then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        console.log(">!< Looks like something went wrong :/ >!<");
      }
    })
    .then(data => {
      categoryData = {
        "categories": []
      }
      for (category of data) {
        let categoryItem = {
          "id": category.id,
          "title": category.title,
          "category_id": category.subcategory_id,
        }
        categoryData.categories.push(categoryItem)
      }
    })
    .catch(error => {
      console.log(">!< Fetch error >!<", error);
    })
  // return categoryData;
}

templates.categories = Handlebars.compile(`
  <li>
    {{title}}
    <img src="{{img_url}}" alt="photo of cat">
    {{#if children}}
      <ul>
        {{#each children}}
        {{#ifCond {{id}} {{subcategory_id}} }}
            {{v1}} is equal to {{v2}}
              <li>
                  {{subname}}
              </li>
        {{/ifCond}}

        {{/each}}
      </ul>
    {{/if}}
  </li>
`);
