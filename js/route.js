function loadPage(page) {
  const mainContent = document.getElementById('main-content');

  mainContent.classList.add('fade-out');

  setTimeout(() => {
    fetch(page)
      .then(response => {
        if (!response.ok) throw new Error("Page not found");
        return response.text();
      })
      .then(data => {
        mainContent.innerHTML = data;
        mainContent.classList.remove('fade-out');
      })
      .catch(error => {
        mainContent.innerHTML = '<p>Error loading page.</p>';
        mainContent.classList.remove('fade-out');
        console.error('Error:', error);
      });
  }, 150);
}
