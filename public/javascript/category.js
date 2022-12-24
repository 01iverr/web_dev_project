const fetchCategories = () => {
    const API_URL = 'https://wiki-shop.onrender.com/categories/'

    // Fetch the categories
    fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
            // // Search result's section tag
            // const destination = document.getElementById('categorys-dropdown-container')
            //
            // // Get and compile the handlebars template
            // const source = document.getElementById('category-dropdown-link').innerHTML
            // const template = Handlebars.compile(source)

            // Create a link for each category
            const CATEGORY_URL = 'category.html?category='
            for (let category of data) {
                let html = template({
                    link: CATEGORY_URL + category.id,
                    text: category.title,
                })
                destination.innerHTML += html
            }
        })
        .catch((err) => console.log(err))
}

// Add event listener for creating the categories dropdown
const dropdown = document.getElementById('categories-dropdown-nav-item')
dropdown.addEventListener('mouseenter', (event) => {
    event.preventDefault()
    fetchCategories()
})

dropdown.addEventListener('mouseleave', (event) => {
    event.preventDefault()

    // Empty the dropdown list
    const list = document.getElementById('categorys-dropdown-container')
    list.innerHTML = ''
})
