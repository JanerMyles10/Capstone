document.addEventListener('DOMContentLoaded', async () => {
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (!orderId) {
        window.location.href = 'homepage.html';
        return;
    }

    try {
        // Fetch order details
        const response = await fetch(`php/get_order.php?order_id=${orderId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch order details');
        }

        // Update order ID
        document.getElementById('order-id').textContent = orderId;

        // Update order items
        const orderItemsContainer = document.getElementById('order-items');
        data.order.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });

        // Update order summary
        document.getElementById('subtotal').textContent = `$${data.order.subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = data.order.shipping > 0 ? `$${data.order.shipping.toFixed(2)}` : 'Free';
        document.getElementById('total').textContent = `$${data.order.total.toFixed(2)}`;

        // Update view order link
        document.querySelector('.view-order').href = `order-details.html?order_id=${orderId}`;

    } catch (error) {
        console.error('Error loading order details:', error);
        alert('Error loading order details. Please try again later.');
    }
}); 