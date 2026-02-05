(function () {
    // 1. SAFETY LOCK
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // CONFIGURATION
    const BLOCKED_SELECTORS = [
        // Headers & Footers (Keep these if you want a "Cinema Mode", remove if you want to see the menu)
        '.AYaHeader', '.under-header', 'header', '.footer', 'footer', '#headerNav',
        '.SectionsRelated', '.SearchForm',
        
        // ADS & JUNK ONLY (Removed content classes like .article-wrap, .page-cntn)
        '.con_Ad', '.code-block', '#dream7-01',
        '.article-ads', '.footerBox',
        
        // Ads & Banners
        '#adsx', '.AlbaE3lan', '#aplr-notic', '#id-custom_banner',
        '.ad', '.ads', '.advertisement', '.banner', '.social-share',
        'ins.adsbygoogle', '[id*="google_ads"]'
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
            
            /* Ensure Player Modal and CONTENT is Visible */
            .modal, .popup, .overlay, .lightbox, #player-modal, .watch-modal,
            .postEmbed, .sec-main, .servContent, .singleInfo, iframe,
            .article-wrap, .page-cntn {  /* Added content wrappers here just in case */
                display: block !important; 
                visibility: visible !important;
                z-index: 99999 !important;
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
            document.querySelectorAll('iframe[src*="ads"]').forEach(el => el.remove());
            document.querySelectorAll('script[src*="ads"]').forEach(el => el.remove());
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
            autoRedirectToWatch();

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
