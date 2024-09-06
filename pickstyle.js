// Detect the user's system theme preference
function detectColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Add an event listener to detect changes in the system theme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectColorScheme);

// Call the function on initial load
detectColorScheme();
