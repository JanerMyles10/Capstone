// Add to cart functionality
async function addToCart(productId, name, price, image) {
    try {
        const cartItem = {
            id: productId,
            name: name,
            price: parseFloat(price.replace('$', '')),
            image: image,
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
            alert(`${name} added to cart!`);
            // Update cart count
            updateCartCount();
        } else {
            throw new Error(data.message || 'Failed to add item to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding item to cart. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Check login status first
    try {
        const response = await fetch('php/check_login.php');
        const data = await response.json();
        
        if (!data.logged_in) {
            alert('Please log in to view your cart');
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        alert('Error checking login status. Please try again.');
        return;
    }

    const cartContainer = document.getElementById('cart-container');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const emptyCartMessage = document.createElement('div');
    emptyCartMessage.id = 'empty-cart-message';
    emptyCartMessage.innerHTML = '<p>Your cart is empty</p>';
    cartContainer.parentElement.insertBefore(emptyCartMessage, cartContainer);

    // Function to load cart items from database
    async function loadCartItems() {
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
                displayCartItems(data.items);
            } else {
                throw new Error(data.message || 'Failed to load cart items');
            }
        } catch (error) {
            console.error('Error loading cart items:', error);
            alert('Error loading cart items. Please try again.');
        }
    }

    // Function to display cart items
    function displayCartItems(items) {
        if (!items || items.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartContainer.style.display = 'none';
            return;
        }

        emptyCartMessage.style.display = 'none';
        cartContainer.style.display = 'block';
        cartContainer.innerHTML = '';
        
        let subtotal = 0;

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-checkbox">
                    <input type="checkbox" class="item-select" data-id="${item.product_id}" data-price="${item.price}" data-quantity="${item.quantity}">
                </div>
                <img src="${item.image}" alt="${item.product_name}">
                <div class="item-details">
                    <h3>${item.product_name}</h3>
                    <p class="price">$${parseFloat(item.price).toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${item.product_id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.product_id}">+</button>
                    </div>
                </div>
                <button class="remove-btn" data-id="${item.product_id}">×</button>
            `;
            cartContainer.appendChild(itemElement);

            // Calculate subtotal
            subtotal += parseFloat(item.price) * parseInt(item.quantity);
        });

        // Update totals
        const shipping = 5.00; // Fixed shipping fee
        const tax = subtotal * 0.12; // 12% tax
        const total = subtotal + shipping + tax;

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;

        // Add event listeners for checkboxes
        const checkboxes = document.querySelectorAll('.item-select');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedItemsTotal);
        });
    }

    // Function to update total for selected items
    function updateSelectedItemsTotal() {
        const selectedCheckboxes = document.querySelectorAll('.item-select:checked');
        let selectedSubtotal = 0;

        selectedCheckboxes.forEach(checkbox => {
            const price = parseFloat(checkbox.dataset.price);
            const quantity = parseInt(checkbox.dataset.quantity);
            selectedSubtotal += price * quantity;
        });

        const shipping = selectedCheckboxes.length > 0 ? 5.00 : 0; // Fixed shipping fee
        const tax = selectedSubtotal * 0.12; // 12% tax
        const total = selectedSubtotal + shipping + tax;

        // Update the totals display
        subtotalElement.textContent = `$${selectedSubtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Function to update item quantity
    async function updateQuantity(itemId, newQuantity) {
        try {
            const response = await fetch('php/cart_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update',
                    item_id: itemId,
                    quantity: newQuantity
                })
            });

            const data = await response.json();
            
            if (data.success) {
                loadCartItems(); // Reload cart items
            } else {
                throw new Error(data.message || 'Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Error updating quantity. Please try again.');
        }
    }

    // Function to remove item
    async function removeItem(itemId) {
        try {
            const response = await fetch('php/cart_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'remove',
                    item_id: itemId
                })
            });

            const data = await response.json();
            
            if (data.success) {
                loadCartItems(); // Reload cart items
            } else {
                throw new Error(data.message || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Error removing item. Please try again.');
        }
    }

    // Event delegation for cart item buttons
    cartContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const itemId = target.dataset.id;

        if (!itemId) return;

        if (target.classList.contains('quantity-btn')) {
            const quantityElement = target.parentElement.querySelector('.quantity');
            let quantity = parseInt(quantityElement.textContent);

            if (target.classList.contains('minus')) {
                quantity = Math.max(0, quantity - 1);
            } else if (target.classList.contains('plus')) {
                quantity += 1;
            }

            await updateQuantity(itemId, quantity);
        } else if (target.classList.contains('remove-btn')) {
            if (confirm('Are you sure you want to remove this item?')) {
                await removeItem(itemId);
            }
        }
    });

    // Handle select all checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            const itemCheckboxes = document.querySelectorAll('.item-select');
            itemCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }

    // Handle delete selected button
    const deleteSelectedBtn = document.querySelector('.delete-selected');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', async () => {
            const selectedItems = document.querySelectorAll('.item-select:checked');
            if (selectedItems.length === 0) {
                alert('Please select items to delete');
                return;
            }

            if (confirm(`Are you sure you want to remove ${selectedItems.length} item(s)?`)) {
                for (const checkbox of selectedItems) {
                    await removeItem(checkbox.dataset.id);
                }
            }
        });
    }

    // Handle checkout button
    const checkoutBtn = document.querySelector('.checkout-button');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                // Get selected items
                const selectedCheckboxes = Array.from(document.querySelectorAll('.item-select:checked'));
                console.log('Selected checkboxes:', selectedCheckboxes);
                
                if (selectedCheckboxes.length === 0) {
                    alert('Please select at least one item to checkout');
                    return;
                }

                // Get cart items from database
                console.log('Fetching cart items...');
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
                console.log('Cart items from database:', data);
                
                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch cart items');
                }

                if (!data.items || data.items.length === 0) {
                    alert('Your cart is empty. Please add items before checkout.');
                    return;
                }

                // Filter only selected items
                const selectedItems = data.items.filter(item => {
                    const isSelected = selectedCheckboxes.some(checkbox => 
                        checkbox.dataset.id === item.product_id.toString()
                    );
                    console.log(`Item ${item.product_id} selected:`, isSelected);
                    return isSelected;
                });

                console.log('Selected items after filtering:', selectedItems);

                if (selectedItems.length === 0) {
                    alert('No items selected for checkout');
                    return;
                }

                // Format items for checkout using exact cart table structure
                const checkoutItems = selectedItems.map(item => {
                    console.log('Processing item:', item);
                    return {
                        id: item.id,
                        user_id: item.user_id,
                        product_id: item.product_id,
                        name: item.product_name,
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price),
                        image: item.image
                    };
                });

                console.log('Formatted checkout items:', checkoutItems);

                // Clear any existing checkout items
                localStorage.removeItem('checkoutItems');
                
                // Store items in localStorage for checkout page
                localStorage.setItem('checkoutItems', JSON.stringify(checkoutItems));
                
                // Verify the data was stored correctly
                const storedItems = JSON.parse(localStorage.getItem('checkoutItems'));
                console.log('Stored checkout items:', storedItems);
                
                if (!storedItems || storedItems.length === 0) {
                    throw new Error('Failed to store checkout items');
                }

                // Redirect to checkout page
                window.location.href = 'checkout.html';
                
            } catch (error) {
                console.error('Error preparing checkout:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                });
                alert('Error preparing checkout: ' + error.message);
            }
        });
    }

    // Initial load
    loadCartItems();

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

    // Initialize cart count on page load
    updateCartCount();

    // Fetch and display order history
    async function fetchOrderHistory() {
        try {
            const response = await fetch('php/get_orders.php');
            const data = await response.json();
            
            if (data.success) {
                const orderHistoryContainer = document.getElementById('order-history');
                if (!orderHistoryContainer) return;

                if (data.orders.length === 0) {
                    orderHistoryContainer.innerHTML = `
                        <div class="empty-orders">
                            <h3>No orders yet</h3>
                            <p>Your order history will appear here.</p>
                        </div>
                    `;
                    return;
                }

                orderHistoryContainer.innerHTML = data.orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <h3>Order #${order.id}</h3>
                            <span class="order-date">${new Date(order.order_date).toLocaleDateString()}</span>
                            <span class="order-status">${order.status}</span>
                        </div>
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <img src="${item.image}" alt="${item.name}">
                                    <div class="item-details">
                                        <h4>${item.name}</h4>
                                        <p>Quantity: ${item.quantity}</p>
                                        <p>Price: $${item.price}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-total">
                            <strong>Total: $${order.total}</strong>
                        </div>
                    </div>
                `).join('');
            } else {
                console.error('Failed to fetch orders:', data.message);
            }
        } catch (error) {
            console.error('Error fetching order history:', error);
        }
    }

    // Initialize order history
    fetchOrderHistory();
});
