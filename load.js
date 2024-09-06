// Load header
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.querySelector('header').innerHTML = data;

    // Run the active link logic after loading the header
    var currentPath = window.location.pathname.split('/').pop();
    var navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(function(link) {
        var href = link.getAttribute('href').split('/').pop();
        if (href === currentPath) {
            link.classList.add('active');
        }
    });
  });

// Load footer
fetch('footer.html')
  .then(response => response.text())
  .then(data => {
    document.querySelector('footer').innerHTML = data;
    // Update the last modified date
    document.getElementById('last-modified').innerText = "Last Edit: " + document.lastModified;
  });
