document.addEventListener("DOMContentLoaded", () => {
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const cartItem = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    price: parseFloat(button.dataset.price.replace('$', '')),
                    image: button.dataset.image,
                    quantity: 1
                };

                const response = await fetch('php/cart_operations.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'add',
                        item: cartItem
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    alert(`${cartItem.name} added to cart!`);
                    // Update cart count
                    updateCartCount();
                } else {
                    throw new Error(data.message || 'Failed to add item to cart');
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Error adding item to cart. Please try again.');
            }
        });
    });

    // Add Buy Now functionality
    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const cartItem = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    price: parseFloat(button.dataset.price.replace('$', '')),
                    image: button.dataset.image,
                    quantity: 1
                };

                const response = await fetch('php/cart_operations.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'add',
                        item: cartItem
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    // Store the single item for immediate checkout
                    localStorage.setItem('checkoutItems', JSON.stringify([cartItem]));
                    // Redirect to checkout page
                    window.location.href = 'checkout.html';
                } else {
                    throw new Error(data.message || 'Failed to add item to cart');
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Error adding item to cart. Please try again.');
            }
        });
    });

    // Update cart count
    async function updateCartCount() {
        try {
            const response = await fetch('php/cart_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'get'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
                    cartCount.textContent = totalItems;
                }
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    // Initialize cart count
    updateCartCount();

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    function filterProducts() {
        const query = searchInput.value.trim().toLowerCase();
        const products = document.querySelectorAll('.product');

        products.forEach(product => {
            const name = product.querySelector('h2').textContent.toLowerCase();
            if (name.includes(query)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', filterProducts);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterProducts();
            }
        });
    }
});
