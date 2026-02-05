(function () {
    // 1. SAFETY LOCK
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // CONFIGURATION
    const BLOCKED_SELECTORS = [
        // Headers & Footers
        '.AYaHeader', '.under-header', 'header', '.footer', 'footer', '#headerNav',
        '.SectionsRelated', '.SearchForm',
        // JUNK REMOVAL
        '.con_Ad', '.code-block', '#dream7-01',
        '.article-wrap', '.page-cntn', '.cat-title', '.article-ads',
        '.category-cntn', '.one-cat', '.copyRight', '.footerBox',
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
            
            /* Hide Original Watch Button (To force Download button usage) */
            #btnWatch, .single-watch-btn {
                display: none !important;
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
                    
                    // Re-apply button hijack if buttons are re-rendered
                    if (node.querySelector && node.querySelector('#btnDown')) {
                         forceDownloadToWatch();
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 5: FORCE DOWNLOAD-TO-WATCH (HIJACK)
    // ==========================================
    function forceDownloadToWatch() {
        const watchBtn = document.getElementById('btnWatch') || document.querySelector('.single-watch-btn');
        const downBtn = document.getElementById('btnDown') || document.querySelector('.single-download-btn');

        if (watchBtn && downBtn) {
            // Logic: User sees Download -> Clicks Download -> Opens Watch Link
            
            // 1. Sanitize the Download Button
            downBtn.removeAttribute('target'); // Prevent new tab if specific
            
            // 2. Hijack the click event
            // Remove old listeners by cloning (optional, but robust)
            const newDownBtn = downBtn.cloneNode(true);
            downBtn.parentNode.replaceChild(newDownBtn, downBtn);
            
            newDownBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Redirect to the Watch URL
                if (watchBtn.href) {
                    console.log("Hijacked Download -> Opening Watch Link");
                    window.location.href = watchBtn.href;
                }
            }, true);

            // 3. Ensure Watch Button is hidden (CSS handles this, but JS reinforces)
            watchBtn.style.display = 'none';
        }
    }

    // ==========================================
    // INIT
    // ==========================================
    function init() {
        try {
            injectSuperStyles();
            cleanJunk();
            forceDownloadToWatch(); // Activate Hijack

            document.querySelectorAll('video').forEach(enhanceVideo);
            startMonitoring();

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log("Safe Optimization + Download Hijack Loaded");
        } catch (e) {
            console.error("Error:", e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
