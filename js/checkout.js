document.addEventListener('DOMContentLoaded', async () => {
    // Check login status first
    try {
        const response = await fetch('php/check_login.php');
        const data = await response.json();
        console.log('Login check response:', data);
        
        if (!data.logged_in) {
            alert('Please log in to continue with checkout');
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        alert('Error checking login status. Please try again.');
        return;
    }

    // Get checkout items from localStorage
    let checkoutItems = [];
    try {
        const storedItems = localStorage.getItem('checkoutItems');
        console.log('Raw stored items:', storedItems);
        
        if (storedItems) {
            checkoutItems = JSON.parse(storedItems);
            console.log('Parsed checkout items:', checkoutItems);
            
            if (!Array.isArray(checkoutItems) || checkoutItems.length === 0) {
                console.error('Invalid checkout items format');
                alert('No items found in cart. Please add items to cart first.');
                window.location.href = 'cart.html';
                return;
            }
        } else {
            console.error('No checkout items found in localStorage');
            alert('No items found in cart. Please add items to cart first.');
            window.location.href = 'cart.html';
            return;
        }
    } catch (error) {
        console.error('Error parsing checkout items:', error);
        alert('Error loading cart items. Please try again.');
        window.location.href = 'cart.html';
        return;
    }

    const checkoutItemsContainer = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const loadingOverlay = document.querySelector('.loading');
    const checkoutForm = document.getElementById('checkout-form');
    const saveAddressBtn = document.getElementById('save-address');

    // Display checkout items
    function displayCheckoutItems() {
        console.log('Displaying checkout items:', checkoutItems);
        checkoutItemsContainer.innerHTML = '';
        let subtotal = 0;

        checkoutItems.forEach((item, index) => {
            console.log(`Processing item ${index}:`, item);
            
            // Ensure all required properties exist based on cart table structure
            if (!item || !item.product_id || !item.name || !item.price || !item.quantity) {
                console.error('Invalid item:', item);
                return;
            }

            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            
            // Format price to ensure it's a number
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            
            itemElement.innerHTML = `
                <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${quantity}</p>
                    <span class="item-price">$${price.toFixed(2)}</span>
                </div>
            `;
            checkoutItemsContainer.appendChild(itemElement);

            // Calculate subtotal
            subtotal += price * quantity;
        });

        // Calculate totals
        const shipping = 5.00; // Fixed shipping fee
        const tax = subtotal * 0.12; // 12% tax
        const total = subtotal + shipping + tax;

        // Update summary
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = `$${shipping.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;

        console.log('Calculated totals:', {
            subtotal,
            shipping,
            tax,
            total
        });
    }

    // Fetch user data from server
    async function fetchUserData() {
        try {
            const response = await fetch('php/get_user_data.php');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            
            if (data.success) {
                // Populate form with user data
                document.getElementById('fullname').value = data.user.username || '';
                document.getElementById('phone').value = data.user.number || '';
                document.getElementById('email').value = data.user.email || '';
                document.getElementById('address').value = data.user.address || '';
                document.getElementById('city').value = data.user.city || 'Manila';
                document.getElementById('postal_code').value = data.user.postal_code || '1000';
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Save address as default
    async function saveDefaultAddress() {
        try {
            const formData = {
                username: document.getElementById('fullname').value.trim(),
                number: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim(),
                postal_code: document.getElementById('postal_code').value.trim()
            };

            // Validate required fields
            const requiredFields = ['username', 'number', 'email', 'address', 'city', 'postal_code'];
            const missingFields = requiredFields.filter(field => !formData[field]);

            if (missingFields.length > 0) {
                alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            console.log('Saving address:', formData);

            const response = await fetch('php/update_user_data.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('Server response:', result);

            if (result.success) {
                alert('Address saved successfully');
            } else {
                throw new Error(result.message || 'Failed to save address');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Error saving address: ' + error.message);
        }
    }

    // Handle payment method selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // Handle save address button click
    saveAddressBtn.addEventListener('click', saveDefaultAddress);

    // Handle form submission
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission started');

        if (checkoutItems.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Validate form fields
        const formData = {
            username: document.getElementById('fullname').value.trim(),
            email: document.getElementById('email').value.trim(),
            number: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            postal_code: document.getElementById('postal_code').value.trim(),
            payment_method: document.querySelector('input[name="payment"]:checked')?.value
        };

        // Validate required fields
        const requiredFields = ['username', 'email', 'number', 'address', 'city', 'postal_code', 'payment_method'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Calculate totals
        const subtotal = checkoutItems.reduce((sum, item) => {
            const price = parseFloat(item.price);
            return sum + (price * item.quantity);
        }, 0);
        const shipping = 5.00; // Fixed shipping fee
        const tax = subtotal * 0.12; // 12% tax
        const total = subtotal + shipping + tax;

        // Prepare order data
        const orderData = {
            ...formData,
            items: checkoutItems.map(item => ({
                id: item.id,
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price: parseFloat(item.price),
                image: item.image
            })),
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total
        };

        console.log('Sending order data:', orderData);

        try {
            // Show loading state
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }

            const response = await fetch('php/process_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            console.log('Server response:', result);

            if (result.success) {
                // Clear cart and checkout items
                localStorage.removeItem('cart');
                localStorage.removeItem('checkoutItems');
                
                // Show success message
                alert('Order placed successfully! Thank you for your purchase.');
                
                // Redirect to homepage
                window.location.replace('homepage.html');
            } else {
                throw new Error(result.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred while placing your order: ' + error.message);
        } finally {
            // Hide loading state
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
    });

    // Initialize
    displayCheckoutItems();
    fetchUserData();
});
