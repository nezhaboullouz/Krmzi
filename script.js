(function () {
    /* 
       ================================================================
       🚀 3CKTV ULTIMATE OPTIMIZER (GEOMETRIC SHIELD EDITION)
       ================================================================
       1. Safe Mode: Never hides content (prevent white screen).
       2. Geometric Cleaner: Automatically detects and hides ANY element covering the player.
       3. Auto Redirect: Goes to watch mode if available.
    */

    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // --- CONFIGURATION ---
    const SAFE_AD_SELECTORS = [
        '.con_Ad', '.code-block', 
        '#dream7-01', '#dream7-03', 
        '.article-ads', '.footerBox',
        '#adsx', '.AlbaE3lan', '#aplr-notic', '#id-custom_banner',
        '.ad', '.ads', '.advertisement', '.banner', '.social-share',
        'ins.adsbygoogle', '[id*="google_ads"]'
    ].join(', ');

    // ==========================================
    // MODULE 1: FLUID CSS (SAFE)
    // ==========================================
    function injectSafeStyles() {
        const styleId = 'optimized-safe-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* Hide ONLY known ads */
            ${SAFE_AD_SELECTORS} {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                z-index: -9999 !important;
            }
            
            /* Fix Body Scroll but keep content */
            body, html {
                overflow-x: hidden !important;
                max-width: 100vw !important;
            }
            
            /* FORCE PLAYER VISIBILITY */
            .postEmbed, .servContent, .singleInfo, #player-modal, iframe, .active-server {
                z-index: 2147483600 !important; /* High but allow Geometric Shield */
                position: relative !important;
                opacity: 1 !important;
                visibility: visible !important;
                display: block !important;
            }

            /* FORCE CONTENT VISIBILITY */
            .article-wrap, .page-cntn, .category-cntn, .one-cat, .cat-title {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                height: auto !important;
                width: auto !important;
            }
            
            /* HIDE AD IFRAMES */
            iframe[src*="google"], iframe[src*="doubleclick"] {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // MODULE 2: GEOMETRIC CLEANER (THE FIX)
    // ==========================================
    function geometricClean() {
        // 1. Find the active player (Try multiple selectors)
        const player = document.querySelector('.postEmbed iframe') || 
                       document.querySelector('.postEmbed') ||
                       document.querySelector('iframe[src*="vidsp"]');
        
        if (!player) return;

        const playerRect = player.getBoundingClientRect();
        
        // If player is hidden or tiny, don't run
        if (playerRect.width < 10 || playerRect.height < 10) return;

        // 2. Scan all elements in the body
        const allElements = document.body.querySelectorAll('*');

        allElements.forEach(el => {
            // Safety: Skip the player itself and its parents
            if (el === player || player.contains(el) || el.contains(player)) return;
            // Safety: Skip layout containers
            if (el.tagName === 'BODY' || el.tagName === 'HTML' || el.className.includes('container') || el.className.includes('row') || el.className.includes('col-')) return;
            // Safety: Skip Safe Content
            if (el.className.includes('article') || el.className.includes('cat-title') || el.className.includes('page-cntn')) return;

            const elRect = el.getBoundingClientRect();

            // 3. CHECK OVERLAP
            // Is this element physically covering the player area?
            // (Math logic: If rects intersect)
            const isOverlapping = !(elRect.right < playerRect.left || 
                                  elRect.left > playerRect.right || 
                                  elRect.bottom < playerRect.top || 
                                  elRect.top > playerRect.bottom);

            if (isOverlapping) {
                // If it physically touches the player...
                const style = window.getComputedStyle(el);
                const zIndex = parseInt(style.zIndex) || 0;
                
                // If it's a known ad class OR has high z-index OR is fixed/absolute
                const isAdSignature = (el.id && el.id.includes('dream')) || (el.className && el.className.includes('ads')) || el.tagName === 'IFRAME';
                const isFloating = style.position === 'fixed' || style.position === 'absolute';

                // HIDE IT if it's suspicious
                if (isAdSignature || (isFloating && zIndex > 5)) {
                    // console.log("Hiding Overlapping Element:", el);
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                }
            }
        });
    }

    // ==========================================
    // MODULE 3: STANDARD CLEANING
    // ==========================================
    function cleanKnownJunk() {
        const junk = document.querySelectorAll(SAFE_AD_SELECTORS);
        junk.forEach(el => el.remove());
        
        // Kill ad iframes specifically
        document.querySelectorAll('iframe').forEach(ifr => {
            if (ifr.src.includes('google') || ifr.src.includes('doubleclick') || ifr.src.includes('ads')) {
                ifr.remove();
            }
        });
    }

    // ==========================================
    // MODULE 4: VIDEO ENHANCER
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
    // INIT
    // ==========================================
    function startMonitoring() {
        // Run cleaning loop frequently
        setInterval(() => {
            cleanKnownJunk();
            geometricClean(); // Continuously check for overlap
        }, 1500);

        // Observer for new videos
        const observer = new MutationObserver((mutations) => {
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

    function autoRedirectToWatch() {
        if (!window.location.search.includes('do=watch')) {
            const watchBtn = document.getElementById('btnWatch');
            if (watchBtn && watchBtn.href) {
                window.location.href = watchBtn.href;
            }
        }
    }

    function init() {
        try {
            injectSafeStyles();
            cleanKnownJunk();
            autoRedirectToWatch();
            document.querySelectorAll('video').forEach(enhanceVideo);
            startMonitoring();

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
