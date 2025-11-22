// Get the base URL
const baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')
    ? '' // Empty string for local development
    : window.location.origin + "/Bully-Modding-Documentation"; // Full path for GitHub Pages

// Centralized title management
function updatePageTitle() {
    const currentTitle = document.title;
    const currentPath = window.location.pathname;

    // Don't modify the title if:
    // 1. It's already the full site title
    // 2. It's the main index page
    // 3. It already has the suffix
    if (currentTitle === 'Bully Modding Documentation' ||
        currentPath === '/' ||
        currentPath === '/index.html' ||
        currentTitle.includes(' - Bully Modding Documentation')) {
        return;
    }

    // Append site suffix
    document.title = `${currentTitle} - Bully Modding Documentation`;
}

// Update title when DOM is loaded
document.addEventListener('DOMContentLoaded', updatePageTitle);

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

        // Mobile Menu Toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const navUl = document.querySelector('nav ul');

        if (menuToggle && navUl) {
            menuToggle.addEventListener('click', () => {
                navUl.classList.toggle('show');
            });
        }

        // Add hover delay functionality to dropdowns
        setupDropdownDelays();

        // Run the active link logic after updating the href attributes
        var currentPath = window.location.pathname;

        // First, handle regular links
        navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === 'javascript:void(0);') return; // Skip dropdown toggles
            if (link.getAttribute('target') === '_blank') return; // Skip external links

            // Compare full pathname for accuracy across nested paths
            const linkPathname = new URL(href, window.location.origin).pathname;
            if (currentPath === linkPathname) {
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

        // Ensure BLOG is highlighted on all blog routes (index and post pages)
        if (currentPath.includes('/blog/')) {
            const blogNav = document.getElementById('nav-blog');
            if (blogNav) blogNav.classList.add('active');
        }

    });

// Load footer
fetch(`${baseURL}/footer.html`)
    .then(response => response.text())
    .then(data => {
        document.querySelector('footer').innerHTML = data;

        // Update the last modified date - handle blog posts differently
        updateLastModified();

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

// Table Body Toggle Functionality
function toggleTableBody(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    const headerRow = tbody.previousElementSibling.querySelector('tr');
    const toggleLink = headerRow.querySelector('.table-toggle');

    if (tbody.style.display === 'none') {
        tbody.style.display = 'table-row-group';
        toggleLink.textContent = 'collapse';
    } else {
        tbody.style.display = 'none';
        toggleLink.textContent = 'expand';
    }
}

// Dropdown Hover Delay Functionality
function setupDropdownDelays() {
    const dropdowns = document.querySelectorAll('.dropdown');
    const delay = 200; // hover delay ms

    dropdowns.forEach(dropdown => {
        let showTimeout;
        let hideTimeout;

        // Mouse enter - show dropdown after delay
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            showTimeout = setTimeout(() => {
                const dropdownContent = dropdown.querySelector('.dropdown-content');
                if (dropdownContent) {
                    dropdownContent.style.display = 'block';
                }
            }, delay);
        });

        // Mouse leave - hide dropdown after delay
        dropdown.addEventListener('mouseleave', () => {
            clearTimeout(showTimeout);
            hideTimeout = setTimeout(() => {
                const dropdownContent = dropdown.querySelector('.dropdown-content');
                if (dropdownContent) {
                    dropdownContent.style.display = 'none';
                }
            }, delay);
        });
    });
}

// Update Last Modified Date
async function updateLastModified() {
    const lastModifiedEl = document.getElementById('last-modified');
    if (!lastModifiedEl) return;

    // Check if we're on a blog post page
    if (window.location.pathname.includes('/blog/post.html')) {
        // Hide the footer date on blog pages
        lastModifiedEl.style.display = 'none';
        return;
    }

    // Default behavior for non-blog pages
    lastModifiedEl.innerText = "Last Edit: " + document.lastModified;
}
