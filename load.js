// Get the base URL
const baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? '' // Empty string for local development
    : window.location.origin + "/Bully-Modding-Documentation"; // Full path for GitHub Pages

// Load header
fetch(`${baseURL}/header.html`)
  .then(response => response.text())
  .then(data => {
    document.querySelector('header').innerHTML = data;

    // Update href attributes to include the base URL, but skip 'javascript:void(0)' links
    var navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        const relativeHref = link.getAttribute("href");
        
        // Ensure we don't modify absolute URLs or 'javascript:void(0)' links
        if (!relativeHref.startsWith("http") && relativeHref !== 'javascript:void(0);') {
            link.setAttribute("href", `${baseURL}/${relativeHref}`);
        }
    });

    // Run the active link logic after updating the href attributes
    var currentPath = window.location.pathname;
    
    // First, handle regular links
    navLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        if (href === 'javascript:void(0);') return; // Skip dropdown toggles
        
        if (currentPath.endsWith(href.split('/').pop())) {
            // Add active class to the current link
            link.classList.add('active');
            
            // Find and activate only the direct parent dropdowns
            let parent = link.parentElement;
            while (parent && parent.tagName !== 'NAV') {
                if (parent.classList.contains('dropdown')) {
                    const parentLink = parent.querySelector('a');
                    if (parentLink) {
                        parentLink.classList.add('active');
                    }
                }
                parent = parent.parentElement;
            }
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

    // Back to top button functionality
    const backToTopButton = document.getElementById('back-to-top');
    
    // Show button when user scrolls down 300px
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top when button is clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
  });
