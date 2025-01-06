document.addEventListener('DOMContentLoaded', function() {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            populateCategories(data.categories);
            populateMenuItems(data.categories);
        });

    function populateCategories(categories) {
        const categorySelect = document.getElementById('category-select');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name.toLowerCase().replace(/\s+/g, '-');
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    function populateMenuItems(categories) {
        const menuItemsContainer = document.getElementById('menu-items');
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.id = category.name.toLowerCase().replace(/\s+/g, '-');
            categoryDiv.classList.add('category');

            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.name;
            categoryDiv.appendChild(categoryTitle);

            category.items.forEach(item => {
                const productElement = createProductElement(item);
                categoryDiv.appendChild(productElement);
            });

            menuItemsContainer.appendChild(categoryDiv);
        });
    }

    function createProductElement(product) {
        const productElement = document.createElement('div');
        productElement.classList.add('menu-item');
        productElement.dataset.name = product.name;
        productElement.dataset.price = product.price.discounted;

        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="toggleDetails(this)">
            <div class="details">
                <h3 onclick="toggleDetails(this)">${product.name}</h3>
                <p>${product.description || ''}</p>
                <div class="rating">
                    <span class="stars">⭐ ${product.rating || ''}</span>
                </div>
                <p><span class="price">${product.price.discounted.toLocaleString()} VND</span></p>
                <div class="quantity-controls">
                    <button onclick="changeQuantity(this, -1)">-</button>
                    <span class="quantity">0</span>
                    <button onclick="changeQuantity(this, 1)">+</button>
                </div>
                <div class="product-details" style="display: none;">
                    <p>Additional details about the ${product.name}...</p>
                </div>
            </div>
        `;

        return productElement;
    }

    window.scrollToCategory = function() {
        const category = document.getElementById('category-select').value;
        if (category) {
            const element = document.getElementById(category);
            if (element) {
                smoothScrollTo(element);
            }
        }
    }

    function smoothScrollTo(element) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        window.requestAnimationFrame(function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const ease = easeInOutCubic(progress / duration);
            window.scrollTo(0, startPosition + distance * ease);
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        });
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    window.toggleDetails = function(element) {
        const allDetails = document.querySelectorAll('.product-details');
        allDetails.forEach(detail => {
            if (detail !== element.parentElement.querySelector('.product-details')) {
                detail.style.display = 'none';
            }
        });

        const details = element.parentElement.querySelector('.product-details');
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }

    window.changeQuantity = function(button, change) {
        const quantitySpan = button.parentElement.querySelector('.quantity');
        let currentQuantity = parseInt(quantitySpan.textContent);
        currentQuantity += change;
        if (currentQuantity < 0) {
            currentQuantity = 0;
        }
        quantitySpan.textContent = currentQuantity;
        updateTotalBill();
    }

    function updateTotalBill() {
        const menuItems = document.querySelectorAll('.menu-item');
        let totalPrice = 0;
        menuItems.forEach(item => {
            const price = parseInt(item.dataset.price);
            const quantity = parseInt(item.querySelector('.quantity').textContent);
            totalPrice += price * quantity;
        });
        document.getElementById('total-price').textContent = `${totalPrice.toLocaleString()} VND`;
    }

    window.redirectToConfirmPage = function() {
        const quantities = Array.from(document.querySelectorAll('.menu-item')).map(item => {
            const name = item.querySelector('h3').textContent;
            const quantity = parseInt(item.querySelector('.quantity').textContent);
            const price = parseInt(item.getAttribute('data-price'));
            const image = item.querySelector('img').src;
            return { name, quantity, price, image };
        });
        localStorage.setItem('orderQuantities', JSON.stringify(quantities));
        window.location.href = 'order-summary.html';
    }

    window.showSuggestions = function() {
        const input = document.getElementById('search-input').value.toLowerCase();
        const suggestionsContainer = document.getElementById('suggestions-container');
        suggestionsContainer.innerHTML = '';

        if (input.length === 0) {
            return;
        }

        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const name = item.dataset.name.toLowerCase();
            if (name.includes(input)) {
                const suggestion = document.createElement('div');
                suggestion.classList.add('suggestion');
                suggestion.textContent = item.dataset.name;
                suggestion.onclick = () => {
                    document.getElementById('search-input').value = item.dataset.name;
                    suggestionsContainer.innerHTML = '';
                };
                suggestionsContainer.appendChild(suggestion);
            }
        });
    }

    window.handleKeyDown = function(event) {
        if (event.key === 'Enter') {
            const input = document.getElementById('search-input').value.toLowerCase();
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                const name = item.dataset.name.toLowerCase();
                if (name.includes(input)) {
                    item.scrollIntoView();
                    item.querySelector('.details').style.backgroundColor = '#ffff99'; // Highlight the item
                    setTimeout(() => {
                        item.querySelector('.details').style.backgroundColor = ''; // Remove highlight after a short delay
                    }, 2000);
                }
            });
        }
    }
});