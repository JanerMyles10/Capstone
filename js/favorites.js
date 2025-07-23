document.addEventListener("DOMContentLoaded", () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const container = document.getElementById('favorites-container');

    if (favorites.length === 0) {
        container.innerHTML = "<p>No favorite items yet.</p>";
        return;
    }

    favorites.forEach(item => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <p>${item.price}</p>
            <div class="ratings">${item.rating}</div>
        `;
        container.appendChild(div);
    });
});
