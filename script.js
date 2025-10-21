// adblock.js

// Function to block ads by hiding ad-related elements
function blockAds() {
    const adSelectors = [
        '[id*="ad"], [class*="ad"]',
        'div[id*="div-gpt-ad"], div[id*="google_ads_iframe"]',
        '#AdContent',
        '.adsbygoogle',
        'ins.adsbygoogle',
        '#mainContainer'
    ];

    const style = document.createElement('style');
    style.innerHTML = `
        ${adSelectors.join(', ')} {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Execute functions when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    blockAds();
});

// Also execute on document end in case DOMContentLoaded fires too early for some content
window.addEventListener('load', function() {
    blockAds();
});
