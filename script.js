(function () {
    // 1. SAFETY LOCK
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    // 1. BLOCKED LIST (Junk to hide/remove)
    // I removed risky classes like .page-cntn and .article-wrap that cause White Screens
    const BLOCKED_SELECTORS = [
        // Headers & Footers (Safe to hide)
        '.AYaHeader', '.under-header', 'header', '.footer', 'footer', '#headerNav',
        '.SectionsRelated', '.SearchForm', '.copyRight', '.footerBox',
        // Ad Containers
        '.con_Ad', '.code-block', '#dream7-01', '.article-ads',
        // Ads & Banners
        '#adsx', '.AlbaE3lan', '#aplr-notic', '#id-custom_banner',
        '.ad', '.ads', '.advertisement', '.banner', '.social-share',
        'ins.adsbygoogle', '[id*="google_ads"]'
    ].join(', ');

    // 2. SAFE LIST (CRITICAL: These are FORCED to show to prevent White Screen)
    const SAFE_SELECTORS = [
        '.singleـwrapper', 
        '.single_wrapper', 
        '.single_content',
        '.postContent',
        '.entry-content',
        '.single_main',
        'video',
        '.watch-modal',
        '#player-modal'
    ].join(', ');

    // ==========================================
    // MODULE 1: VISUAL ENGINE (CSS)
    // ==========================================
    function injectSuperStyles() {
        const styleId = 'optimized-blocker-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* 1. HIDE JUNK */
            ${BLOCKED_SELECTORS} {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                z-index: -9999 !important;
            }
            
            /* 2. FORCE SHOW CONTENT (Fixes White Screen on 4G) */
            ${SAFE_SELECTORS} {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                height: auto !important;
                width: auto !important;
                position: relative !important;
                z-index: 1 !important;
            }

            /* 3. PLAYER & IFRAME FIXES (Ensure Video is visible) */
            .modal, .popup, .overlay, .lightbox, #player-modal, iframe {
                display: block !important; 
                visibility: visible !important;
                z-index: 99999 !important; 
                opacity: 1 !important;
            }

            /* 4. BUTTON MANAGER */
            #btnDown, .single-download-btn { display: none !important; } /* Hide Download */
            #btnWatch, .single-watch-btn { 
                display: flex !important; 
                visibility: visible !important; 
                opacity: 1 !important;
            }

            /* 5. BODY OPTIMIZATION */
            body, html {
                overflow-x: hidden !important;
                background-color: #111 !important; /* Prevents white flash */
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // MODULE 2: RADICAL CLEANER (DOM Removal)
    // ==========================================
    function cleanJunk() {
        requestAnimationFrame(() => {
            // Remove ad iframes and scripts completely from memory
            const trash = document.querySelectorAll('iframe[src*="ads"], script[src*="ads"], .ad, .ads');
            trash.forEach(el => el.remove());
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
        
        // Prevent auto-pause interference
        video.addEventListener('pause', (e) => {
            if (!video.ended && video.currentTime > 0 && !video.pausedByClick) {
                e.stopImmediatePropagation();
                video.play().catch(() => {});
            }
            video.pausedByClick = false;
        });

        video.addEventListener('click', () => {
            video.pausedByClick = true;
            setTimeout(() => { video.pausedByClick = false; }, 500);
        });
    }

    // ==========================================
    // MODULE 4: THE SENTINEL (Monitoring)
    // ==========================================
    function startMonitoring() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;

                    // 1. Catch Videos
                    if (node.tagName === 'VIDEO') enhanceVideo(node);
                    else if (node.querySelectorAll) node.querySelectorAll('video').forEach(enhanceVideo);

                    // 2. Kill Ads on Sight (Radical Removal)
                    if (node.tagName === 'IFRAME' && node.src.includes('ads')) {
                        node.remove();
                    }
                    if (node.matches && node.matches(BLOCKED_SELECTORS)) {
                        node.remove();
                    }
                    
                    // 3. Re-apply Button Hijack if content reloads
                    if (node.querySelector && node.querySelector('#btnWatch')) {
                         forceWatchToDownload();
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 5: FORCE WATCH -> DOWNLOAD (Dual Action)
    // ==========================================
    function forceWatchToDownload() {
        const watchBtn = document.getElementById('btnWatch') || document.querySelector('.single-watch-btn');
        const downBtn = document.getElementById('btnDown') || document.querySelector('.single-download-btn');

        if (watchBtn && downBtn) {
            // Clone to remove old listeners
            const newWatchBtn = watchBtn.cloneNode(true);
            watchBtn.parentNode.replaceChild(newWatchBtn, watchBtn);
            
            newWatchBtn.removeAttribute('target'); 
            
            newWatchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const downloadUrl = downBtn.href;
                const watchUrl = newWatchBtn.href;

                // 1. Open Download (Trigger in new tab)
                if (downloadUrl) window.open(downloadUrl, '_blank'); 

                // 2. Go to Watch (Navigate current tab)
                if (watchUrl) setTimeout(() => { window.location.href = watchUrl; }, 100);
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
            forceWatchToDownload(); 
            document.querySelectorAll('video').forEach(enhanceVideo);
            startMonitoring();

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log("Radical Fix Loaded");
        } catch (e) {
            console.error("Error:", e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
