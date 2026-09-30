(function () {
    // 1. SAFETY LOCK
    if (window.__cleanBlockerActive) return;
    window.__cleanBlockerActive = true;

    // 2. BLOCKED ELEMENTS LIST
    const BLOCKED_SELECTORS = [
        'header', 
        '#header', 
        '.main-header',
        '#comments-sec', 
        '.comments-items-sec',
        'footer', 
        '#footer', 
        '.footer'
    ].join(', ');

    // 3. INJECT CSS TO HIDE ELEMENTS INSTANTLY
    function injectHideStyle() {
        const style = document.createElement('style');
        style.textContent = `
            ${BLOCKED_SELECTORS} {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                pointer-events: none !important;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    // 4. REMOVE ELEMENTS FROM DOM
    function removeBlockedNodes() {
        document.querySelectorAll(BLOCKED_SELECTORS).forEach(el => el.remove());
    }

    // 5. OBSERVE FOR DYNAMICALLY ADDED ELEMENTS
    function startObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldRemove = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    shouldRemove = true;
                    break;
                }
            }
            if (shouldRemove) {
                removeBlockedNodes();
            }
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // 6. FIX REFERRER POLICY FOR VIDEO PLAYER (aa.3isk.icu)
    // المشكل ديال الشاشة الكحلة فالتطبيق سببه أن الموقع الثاني كيحتاج Referer
    function fixReferrerPolicy() {
        let meta = document.querySelector('meta[name="referrer"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = "referrer";
            document.head.appendChild(meta);
        }
        meta.content = "unsafe-url";
    }

    // INITIALIZATION
    injectHideStyle();
    fixReferrerPolicy();
    
    // Run DOM removal when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            removeBlockedNodes();
            startObserver();
        });
    } else {
        removeBlockedNodes();
        startObserver();
    }
})();
