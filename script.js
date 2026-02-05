(function () {
    // 1. SAFETY LOCK
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // CONFIGURATION: JUNK ONLY (No content selectors)
    const JUNK_SELECTORS = [
        '.con_Ad', '.code-block', 
        '#dream7-01', '#dream7-03', // The specific ads covering your player
        '.article-ads', '.footerBox',
        '#adsx', '.AlbaE3lan', '#aplr-notic', '#id-custom_banner',
        '.ad', '.ads', '.advertisement', '.banner', '.social-share',
        'ins.adsbygoogle', '[id*="google_ads"]',
        'iframe[src*="google"]', 'iframe[src*="doubleclick"]'
    ].join(', ');

    // ==========================================
    // MODULE 1: CSS BLOCKING & LAYOUT FIXES
    // ==========================================
    function injectSuperStyles() {
        const styleId = 'optimized-blocker-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* Hide known ads */
            ${JUNK_SELECTORS} {
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
            
            /* CRITICAL: FORCE PLAYER ON TOP */
            .postEmbed, .servContent, .singleInfo, #player-modal, iframe {
                display: block !important; 
                visibility: visible !important;
                z-index: 2147483647 !important; /* Max Z-Index */
                opacity: 1 !important;
                position: relative !important;
            }

            /* FORCE CONTENT VISIBLITY (Prevent White Screen) */
            .article-wrap, .page-cntn, .category-cntn, .one-cat {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // MODULE 2: AGGRESSIVE JS CLEANING
    // ==========================================
    function cleanJunk() {
        // Remove known junk elements
        const junk = document.querySelectorAll(JUNK_SELECTORS);
        junk.forEach(el => el.remove());

        // Remove overlapping invisible overlays
        document.querySelectorAll('div, a').forEach(el => {
            const style = window.getComputedStyle(el);
            // If element is fixed/absolute and covers the screen but is NOT the player
            if ((style.position === 'fixed' || style.position === 'absolute') && style.zIndex > 1000) {
                if (!el.querySelector('video') && !el.querySelector('iframe') && !el.className.includes('nav') && !el.className.includes('header')) {
                     el.remove(); // Delete invisible blockers
                }
            }
        });

        // Specific Iframe cleaning
        document.querySelectorAll('iframe').forEach(iframe => {
            if (iframe.src.includes('ads') || iframe.src.includes('doubleclick')) {
                iframe.remove();
            }
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
    // MODULE 4: AUTO-REDIRECT
    // ==========================================
    function autoRedirectToWatch() {
        if (!window.location.search.includes('do=watch')) {
            const watchBtn = document.getElementById('btnWatch');
            if (watchBtn && watchBtn.href) {
                console.log("Auto-redirecting...");
                window.location.href = watchBtn.href;
            }
        }
    }

    // ==========================================
    // INIT
    // ==========================================
    function startMonitoring() {
        const observer = new MutationObserver((mutations) => {
            cleanJunk(); // Clean on every update
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;
                    if (node.tagName === 'VIDEO') enhanceVideo(node);
                    else if (node.querySelectorAll) node.querySelectorAll('video').forEach(enhanceVideo);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        try {
            injectSuperStyles();
            cleanJunk();
            autoRedirectToWatch();
            document.querySelectorAll('video').forEach(enhanceVideo);
            startMonitoring();

            // Notify App
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log("Safe Optimization Loaded");
        } catch (e) {
            console.error("Error:", e);
        }
    }

    // Run immediately and ensure it stays clean
    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);
    
    // Safety Force Clean every 2 seconds
    setInterval(cleanJunk, 2000);

})();
