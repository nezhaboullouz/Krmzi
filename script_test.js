// adblock_v3.js

console.log("Adblocker script started");

function removeAds() {
    const adSelectors = [
        '[id*="ad"], [class*="ad"]',
        'div[id*="div-gpt-ad"]',
        'div[id*="google_ads_iframe"]',
        '#AdContent',
        '.adsbygoogle',
        'ins.adsbygoogle',
        '#mainContainer'
    ];

    function hideElements(elements) {
        for (const element of elements) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.width = '0';
            element.style.height = '0';
            element.style.opacity = '0';
            element.style.pointerEvents = 'none';
        }
    }

    // Initial removal
    hideElements(document.querySelectorAll(adSelectors.join(',')));

    // Use MutationObserver to detect and remove ads that are loaded dynamically
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    for (const selector of adSelectors) {
                        if (node.matches(selector)) {
                            hideElements([node]);
                        }
                        hideElements(node.querySelectorAll(selector));
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Execute functions when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    removeAds();
});

// Also execute on document end
window.addEventListener('load', function() {
    removeAds();
});
