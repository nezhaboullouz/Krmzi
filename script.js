(function () {
    // 1. SAFETY LOCK
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // ==========================================
    // PRE-INIT: INTERCEPT createElement
    // ==========================================
    // Intercept BEFORE any iframe is created — add sandbox immediately
    // This prevents top-level navigation redirects from inside iframes
    (function interceptCreateElement() {
        const _orig = document.createElement.bind(document);
        document.createElement = function (tag) {
            const el = _orig(tag);
            if (tag.toLowerCase() === 'iframe') {
                // Add sandbox before iframe is inserted into DOM
                el.setAttribute('sandbox',
                    'allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock'
                    // NO allow-popups = blocks window.open()
                    // NO allow-top-navigation = blocks page redirect from iframe!
                );
                el.dataset.sandboxed = 'true';
            }
            return el;
        };
    })();

    // ==========================================
    // CONFIGURATION
    // ==========================================

    // 1. BLOCKED LIST (Junk to hide/remove)
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

    // 2. SAFE LIST (CRITICAL: These are FORCED to show)
    const SAFE_SELECTORS = [
        '.singleـwrapper',
        '.single_wrapper',
        '.single_content',
        '.postContent',
        '.entry-content',
        '.single_main',
        'video',
        '.watch-modal',
        '#player-modal',
        '#content', '.content', '.main', '.container'
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
            
            /* 2. FORCE SHOW CONTENT (Fixes White Screen) */
            ${SAFE_SELECTORS} {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                height: auto !important;
                width: auto !important;
                position: relative !important;
                z-index: 1 !important;
            }

            /* 3. PLAYER & IFRAME FIXES */
            .modal, .popup, .overlay, .lightbox, #player-modal, iframe {
                display: block !important; 
                visibility: visible !important;
                z-index: 99999 !important; 
                opacity: 1 !important;
            }

            /* 4. BUTTON MANAGER */
            #btnDown, .single-download-btn { display: none !important; } 
            #btnWatch, .single-watch-btn { 
                display: flex !important; 
                visibility: visible !important; 
                opacity: 1 !important;
            }

            /* 5. BODY OPTIMIZATION - FORCE VISIBILITY */
            body, html {
                overflow-x: hidden !important;
                background-color: #111 !important; 
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // MODULE 2: RADICAL CLEANER (DOM Removal)
    // ==========================================
    function cleanJunk() {
        requestAnimationFrame(() => {
            // 1. Remove ad iframes and scripts completely
            const trash = document.querySelectorAll(
                'iframe[src*="ads"], script[src*="ads"], .ad, .ads, ' +
                'script[src*="madurird"], script[src*="dtscout"], ' +
                'script[src*="llvpn.com"], script[src*="adsterra"], ' +
                'script[src*="monetag"], script[src*="propellerads"], ' +
                'iframe[src*="madurird"], iframe[src*="dtscout"]'
            );
            trash.forEach(el => el.remove());

            // 2. Remove High Z-Index Click-Jacking Overlays
            const highZ = document.querySelectorAll('.con_search, #search, [style*="z-index"]');
            highZ.forEach(el => {
                const style = window.getComputedStyle(el);
                if (parseInt(style.zIndex) > 5000 && !el.className.includes('modal') && !el.className.includes('player')) {
                    el.remove();
                }
            });
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

                    // 2. Kill Ads iframes
                    if (node.tagName === 'IFRAME' && node.src.includes('ads')) node.remove();

                    // 3. Block specific ad networks on sight
                    if ((node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') &&
                        (node.src.includes('madurird') || node.src.includes('dtscout') ||
                         node.src.includes('llvpn.com') || node.src.includes('adsterra') ||
                         node.src.includes('monetag') || node.src.includes('propellerads'))) {
                        node.remove();
                        return;
                    }

                    // 4. Sandbox new iframes to block popups
                    if (node.tagName === 'IFRAME') {
                        sandboxIframe(node);
                    }

                    if (node.matches && node.matches(BLOCKED_SELECTORS)) node.remove();

                    // 5. Hijack Buttons
                    if (node.querySelector && node.querySelector('#btnWatch')) forceWatchToDownload();
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 5: FORCE WATCH -> DOWNLOAD 
    // ==========================================
    function forceWatchToDownload() {
        const watchBtn = document.getElementById('btnWatch') || document.querySelector('.single-watch-btn');
        const downBtn = document.getElementById('btnDown') || document.querySelector('.single-download-btn');

        if (watchBtn && downBtn) {
            const newWatchBtn = watchBtn.cloneNode(true);
            watchBtn.parentNode.replaceChild(newWatchBtn, watchBtn);

            newWatchBtn.removeAttribute('target');

            newWatchBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const downloadUrl = downBtn.href;
                const watchUrl = newWatchBtn.href;

                // 1. Open Download (New Tab)
                if (downloadUrl) window.__safeOpen(downloadUrl, '_blank');

                // 2. FORCE correct Watch URL (Bypass Ad Hrefs)
                let targetUrl = '';
                if (downloadUrl && downloadUrl.includes('do=download')) {
                    targetUrl = downloadUrl.replace('do=download', 'do=watch');
                } else {
                    targetUrl = window.location.pathname + '?do=watch';
                }

                // Go to Watch (Current Tab)
                if (targetUrl) setTimeout(() => { window.location.href = targetUrl; }, 100);
            }, true);
        }
    }

    // ==========================================
    // MODULE 6: RESCUE MODE (Anti-White Screen)
    // ==========================================
    function startRescueInterval() {
        setInterval(() => {
            // 1. Force Body/HTML visibility
            if (document.body.style.display === 'none' || document.body.style.visibility === 'hidden' || document.body.style.opacity === '0') {
                document.body.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #111 !important;');
                document.documentElement.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important;');
            }

            // 2. Look for "White Overlays" (Full screen ad covers)
            const overlays = document.querySelectorAll('div, section, span');
            overlays.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' && style.zIndex > 10000 && style.height === window.innerHeight + 'px') {
                    if (!el.querySelector('video') && !el.className.includes('modal') && !el.className.includes('player')) {
                        el.remove();
                    }
                }
            });

            // 3. Ensure we didn't accidentally hide the content wrapper
            const wrappers = document.querySelectorAll('.singleـwrapper, .single_content, .postContent');
            wrappers.forEach(el => {
                if (el.style.display === 'none') el.style.display = 'block';
            });

        }, 1500);
    }

    // ==========================================
    // MODULE 7: IFRAME SANDBOX (Anti-Popunder + Anti-Redirect)
    // ==========================================
    // For already-loaded iframes: clone + re-insert with sandbox (forces reload with sandbox)
    // For new iframes: handled by createElement override above
    function sandboxIframe(iframe) {
        if (iframe.dataset.sandboxed) return;
        iframe.dataset.sandboxed = 'true';
        const current = iframe.getAttribute('sandbox') || '';
        if (!current.includes('allow-popups')) {
            const sandboxVal = 'allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock';
            // If iframe already loaded, clone it so sandbox takes effect
            if (iframe.src && iframe.contentDocument === null) {
                // Cross-origin already loaded: set sandbox and force src refresh
                iframe.setAttribute('sandbox', sandboxVal);
                const src = iframe.src;
                iframe.src = '';
                requestAnimationFrame(() => { iframe.src = src; });
            } else {
                iframe.setAttribute('sandbox', sandboxVal);
            }
        }
    }

    function sandboxAllIframes() {
        document.querySelectorAll('iframe').forEach(sandboxIframe);
    }

    // ==========================================
    // MODULE 8: BLOCK window.open (Anti-Popup)
    // ==========================================
    // Save a safe reference for internal use (e.g. watch button)
    window.__safeOpen = window.open.bind(window);

    function blockPopups() {
        // Override window.open to block all popup ads
        // Only allow calls that come from trusted user interactions
        window.open = function (url, target, features) {
            // Allow internal navigation (same origin or empty)
            if (!url || url === 'about:blank') return null;
            try {
                const origin = new URL(url).origin;
                if (origin === window.location.origin) {
                    return window.__safeOpen(url, target, features);
                }
            } catch (e) { }
            // Block everything else (ads, popunders)
            console.log('[Blocker] Blocked popup:', url);
            return null;
        };
    }

    // ==========================================
    // INIT
    // ==========================================
    function init() {
        try {
            injectSuperStyles();
            cleanJunk();
            blockPopups();       // Block window.open ads
            sandboxAllIframes(); // Sandbox existing iframes
            forceWatchToDownload();
            document.querySelectorAll('video').forEach(enhanceVideo);
            startMonitoring();
            startRescueInterval();

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log('[Blocker] Safe Optimization + Popup Blocker Loaded');
        } catch (e) {
            console.error('[Blocker] Error:', e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
