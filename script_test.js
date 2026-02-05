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
            
            /* Hide Download Button (Users shouldn't see this) */
            #btnDown, .single-download-btn {
                display: none !important;
            }

            /* Ensure Watch Button IS Visible */
            #btnWatch, .single-watch-btn {
                display: flex !important;
                opacity: 1 !important;
                visibility: visible !important;
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
                    if (node.querySelector && node.querySelector('#btnWatch')) {
                         forceWatchToDownload();
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 5: FORCE WATCH-TO-DOWNLOAD (DUAL CLICK)
    // ==========================================
    function forceWatchToDownload() {
        const watchBtn = document.getElementById('btnWatch') || document.querySelector('.single-watch-btn');
        const downBtn = document.getElementById('btnDown') || document.querySelector('.single-download-btn');

        if (watchBtn && downBtn) {
            // Logic: User sees Watch -> Clicks Watch -> 
            // 1. Opens Download Link in New Tab (Real User Click Simulation)
            // 2. Navigates Current Tab to Watch Link
            
            // Remove old listeners
            const newWatchBtn = watchBtn.cloneNode(true);
            watchBtn.parentNode.replaceChild(newWatchBtn, watchBtn);
            
            // Ensure visual state
            newWatchBtn.style.display = 'flex';
            newWatchBtn.removeAttribute('target'); // Handle target manually
            
            newWatchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const downloadUrl = downBtn.href;
                const watchUrl = newWatchBtn.href;

                if (downloadUrl) {
                    // Open Download in New Tab to satisfy "must be clicked" requirement
                    window.open(downloadUrl, '_blank'); 
                }

                if (watchUrl) {
                    // Navigate main window to Watch
                    setTimeout(() => {
                        window.location.href = watchUrl;
                    }, 100);
                }
            }, true);
        }
    }

    // ==========================================
    // INIT
    // ==========================================
    function init() {
        try {
            injectSuperStyles();
            cleanJunk();
            forceWatchToDownload(); // Activate Hijack

            document.querySelectorAll('video').forEach(enhanceVideo);
            startMonitoring();

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log("Safe Optimization + Dual Action Loaded");
        } catch (e) {
            console.error("Error:", e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
