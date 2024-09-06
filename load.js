// Get the base URL
const baseURL = window.location.origin + "/Bully-Modding-Documentation";

// Load header
fetch(`${baseURL}/header.html`)
  .then(response => response.text())
  .then(data => {
    document.querySelector('header').innerHTML = data;

    // Update href attributes to include the base URL
    var navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        const relativeHref = link.getAttribute("href");
        if (!relativeHref.startsWith("http")) { // Ensure we don't modify absolute URLs
            link.setAttribute("href", `${baseURL}/${relativeHref}`);
        }
    });

    // Run the active link logic after updating the href attributes
    var currentPath = window.location.pathname.split('/').pop();
    navLinks.forEach(function(link) {
        var href = link.getAttribute('href').split('/').pop();
        if (href === currentPath) {
            link.classList.add('active');
        }
    });
  });

// Load footer
fetch(`${baseURL}/footer.html`)
  .then(response => response.text())
  .then(data => {
    document.querySelector('footer').innerHTML = data;
    // Update the last modified date
    document.getElementById('last-modified').innerText = "Last Edit: " + document.lastModified;
  });
