(function () {
    // 1. SAFETY LOCK
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // CONFIGURATION: REMOVED .popup, .modal, .overlay from here because they block the player!
    const BLOCKED_SELECTORS = [
        // Headers & Footers
        '.AYaHeader', '.under-header', 'header', '.footer', 'footer', '#headerNav',
        '.SectionsRelated', '.SearchForm',
        // Ads & Banners
        '#adsx', '.AlbaE3lan', '#aplr-notic', '#id-custom_banner',
        '.ad', '.ads', '.advertisement', '.banner', '.social-share',
        'ins.adsbygoogle', '[id*="google_ads"]',
        // Specific Ad Iframes only - REMOVED CSS BLOCKING FOR IFRAMES TO BE SAFE
        // 'iframe[src*="ads"]', 'iframe[src*="tracker"]'
    ].join(', ');

    // ==========================================
    // MODULE 1: FAST CSS HIDING
    // ==========================================
    function injectSuperStyles() {
        const styleId = 'optimized-blocker-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* Hide known junk */
            ${BLOCKED_SELECTORS} {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                z-index: -9999 !important;
            }
            
            /* Body Fixes */
            body, html {
                overflow-x: hidden !important;
                max-width: 100vw !important;
            }
            
            /* Ensure Player Modal is Visible */
            .modal, .popup, .overlay, .lightbox, #player-modal, .watch-modal,
            .postEmbed, .sec-main, .servContent, .singleInfo, iframe {
                display: block !important; 
                visibility: visible !important;
                z-index: 99999 !important; /* Force it on top */
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // MODULE 2: JUNK REMOVAL
    // ==========================================
    function cleanJunk() {
        requestAnimationFrame(() => {
            // Remove ad iframes (Only explicit ads, removed "pop" to be safe)
            document.querySelectorAll('iframe[src*="ads"]').forEach(el => el.remove());
            document.querySelectorAll('script[src*="ads"]').forEach(el => el.remove());

            // DISABLED AGGRESSIVE Z-INDEX CHECK - It was killing the player!
            /*
            const highZ = document.querySelectorAll('div[style*="z-index"], div[style*="position: fixed"]');
            highZ.forEach(el => {
                if (el.style.zIndex > 999 || el.style.position === 'fixed') {
                    if (!el.querySelector('video') && !el.className.includes('player')) {
                        // el.style.display = 'none'; // Dangerous
                    }
                }
            });
            */
        });
    }

    // ==========================================
    // MODULE 3: VIDEO ENHANCER
    // ==========================================
    function enhanceVideo(video) {
        if (video.dataset.enhanced) return;
        video.dataset.enhanced = "true";

        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        // video.setAttribute('controls', 'true'); // Commented out: Might break custom player UI

        video.addEventListener('pause', (e) => {
            if (!video.ended && video.currentTime > 0 && !video.pausedByClick) {
                e.stopImmediatePropagation();
                video.play().catch(() => { });
            }
            video.pausedByClick = false;
        });

        video.addEventListener('click', () => {
            video.pausedByClick = true;
            setTimeout(() => { video.pausedByClick = false; }, 500);
        });
    }

    // ==========================================
    // MODULE 4: MONITORING
    // ==========================================
    function startMonitoring() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;

                    if (node.tagName === 'VIDEO') enhanceVideo(node);
                    else if (node.querySelectorAll) node.querySelectorAll('video').forEach(enhanceVideo);

                    if (node.tagName === 'IFRAME' && node.src.includes('ads')) {
                        node.remove();
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 5: AUTO-REDIRECT TO WATCH
    // ==========================================
    function autoRedirectToWatch() {
        // If we are NOT in watch mode, and there is a watch button
        if (!window.location.search.includes('do=watch')) {
            const watchBtn = document.getElementById('btnWatch');
            if (watchBtn && watchBtn.href) {
                console.log("Auto-redirecting to Watch Mode...");
                window.location.href = watchBtn.href;
            }
        }
    }

    // ==========================================
    // INIT
    // ==========================================
    function init() {
        try {
            injectSuperStyles();
            cleanJunk();
            autoRedirectToWatch(); // Added Auto-Redirect

            document.querySelectorAll('video').forEach(enhanceVideo);
            startMonitoring();

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log("Safe Optimization Loaded");
        } catch (e) {
            console.error("Error:", e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
