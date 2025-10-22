// script.js

// Function to hide header and footer elements
function hideHeaderAndFooter() {
    const style = document.createElement('style');
    style.innerHTML = '#headerNav, footer { display: none !important; }';
    document.head.appendChild(style);
}

// Function to detect text copy and send a message to the native app
function setupTextCopyDetection() {
    document.addEventListener('copy', function(e) {
        // Ensure window.webkit.messageHandlers.textCopyHandler exists before posting
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.textCopyHandler) {
            window.webkit.messageHandlers.textCopyHandler.postMessage('textCopied');
        }
    });
}

// Function to handle specific website modifications
function handleFashnyNet() {
    if (window.location.href.includes('https://fashny.net/')) {
        // Hide everything in the body
        document.body.style.display = 'none';

        // Show only the skipContent div
        const skipContent = document.getElementById('skipContent');
        if (skipContent) {
            skipContent.style.display = 'block';
            skipContent.style.visibility = 'visible'; // Ensure visibility
            document.body.appendChild(skipContent); // Re-append to body to ensure it's visible
            document.body.style.display = 'block'; // Show body again, but only with skipContent
        }
    }
}

// Execute functions when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    hideHeaderAndFooter();
    setupTextCopyDetection();
    handleFashnyNet(); // Call the new function
});

// Also execute on document end in case DOMContentLoaded fires too early for some content
window.addEventListener('load', function() {
    hideHeaderAndFooter();
    handleFashnyNet(); // Call the new function
});
