document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Sample product data (in a real application, this would come from a database)
    const products = {
        'vase': {
            id: 1,
            name: 'Vase',
            price: '$295.00',
            image: 'images/vase.jpg',
            rating: 5.0,
            origin: 'Made in Philippines',
            description: 'Handcrafted ceramic vase with traditional Filipino patterns. Each piece is uniquely made by skilled artisans using age-old techniques passed down through generations.',
            reviews: [
                {
                    author: 'Maria Santos',
                    rating: 5,
                    date: '2024-02-15',
                    comment: 'Beautiful craftsmanship! The vase exceeded my expectations.'
                },
                {
                    author: 'John Smith',
                    rating: 4,
                    date: '2024-02-10',
                    comment: 'Great quality and unique design. Would recommend!'
                }
            ]
        },
        'bamboo': {
            id: 2,
            name: 'Bamboo Handicraft',
            price: '$295.00',
            image: 'images/bamboo.jpg',
            rating: 4.8,
            origin: 'Made in Philippines',
            description: 'Eco-friendly bamboo handicraft, sustainably sourced and crafted by local artisans. Perfect for home decoration and sustainable living.',
            reviews: [
                {
                    author: 'Sarah Johnson',
                    rating: 5,
                    date: '2024-02-18',
                    comment: 'Love the natural look and feel. Very well made!'
                }
            ]
        },
        'weaving': {
            id: 3,
            name: 'Weaving Bag',
            price: '$295.00',
            image: 'images/weaving.jpg',
            rating: 4.9,
            origin: 'Made in Philippines',
            description: 'Traditional handwoven bag made from natural fibers. Each bag is carefully crafted by skilled weavers using traditional techniques.',
            reviews: [
                {
                    author: 'Lisa Chen',
                    rating: 5,
                    date: '2024-02-20',
                    comment: 'Beautiful craftsmanship and very durable!'
                }
            ]
        },
        'woodplate': {
            id: 4,
            name: 'Wood Carved Plate',
            price: '$295.00',
            image: 'images/woodplate.jpg',
            rating: 4.7,
            origin: 'Made in Philippines',
            description: 'Exquisitely carved wooden plate featuring traditional Filipino designs. Each piece is hand-carved by master craftsmen.',
            reviews: [
                {
                    author: 'Michael Brown',
                    rating: 5,
                    date: '2024-02-17',
                    comment: 'The carving details are amazing!'
                }
            ]
        },
        'embroid': {
            id: 5,
            name: 'Embroidered Wallet',
            price: '$295.00',
            image: 'images/embroid.jpg',
            rating: 4.9,
            origin: 'Made in Philippines',
            description: 'Hand-embroidered leather wallet featuring intricate Filipino patterns. Each piece is uniquely designed and crafted.',
            reviews: [
                {
                    author: 'Emma Wilson',
                    rating: 5,
                    date: '2024-02-19',
                    comment: 'The embroidery is so detailed and beautiful!'
                }
            ]
        }
    };

    // Get the product data
    const product = products[productId];
    if (!product) {
        window.location.href = 'homepage.html';
        return;
    }

    // Update product information
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = product.price;
    document.getElementById('product-rating').textContent = `Rating: ${product.rating}`;
    document.getElementById('product-origin').textContent = product.origin;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('main-product-image').src = product.image;

    // Display stars based on rating
    const starsContainer = document.querySelector('.stars');
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        if (i < fullStars) {
            star.textContent = '★';
        } else if (i === fullStars && hasHalfStar) {
            star.textContent = '★';
            star.style.opacity = '0.5';
        } else {
            star.textContent = '☆';
        }
        starsContainer.appendChild(star);
    }

    // Display reviews
    const reviewsList = document.getElementById('reviews-list');
    product.reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        reviewElement.innerHTML = `
            <div class="review-header">
                <span class="review-author">${review.author}</span>
                <span class="review-date">${review.date}</span>
            </div>
            <div class="review-rating">
                ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
            </div>
            <p>${review.comment}</p>
        `;
        reviewsList.appendChild(reviewElement);
    });

    // Handle quantity buttons
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
    });

    // Handle add to cart button
    document.querySelector('.add-cart').addEventListener('click', async () => {
        try {
            const quantity = parseInt(quantityInput.value);
            if (quantity < 1) {
                alert('Please select a valid quantity');
                return;
            }

            const cartItem = {
                product_id: product.id,
                product_name: product.name,
                price: parseFloat(product.price.replace('$', '')),
                image: product.image,
                quantity: quantity
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
                alert(`${product.name} added to cart!`);
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

    // Handle buy now button
    document.querySelector('.buy-now').addEventListener('click', async () => {
        try {
            const quantity = parseInt(quantityInput.value);
            if (quantity < 1) {
                alert('Please select a valid quantity');
                return;
            }

            const response = await fetch('php/process_purchase.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Purchase successful! Your order has been placed.');
                // Redirect to order confirmation page
                window.location.href = `order-confirmation.html?order_id=${data.order_id}`;
            } else {
                if (data.message === 'Please login to make a purchase') {
                    // Redirect to login page if user is not logged in
                    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                } else {
                    throw new Error(data.message || 'Failed to process purchase');
                }
            }
        } catch (error) {
            console.error('Error processing purchase:', error);
            alert(error.message || 'Error processing your purchase. Please try again.');
        }
    });

    // Handle add to favorites button
    document.querySelector('.add-fav').addEventListener('click', () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.push(product);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${product.name} added to favorites!`);
    });
});

// Function to update cart count
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