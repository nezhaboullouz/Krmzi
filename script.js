(function () {
    // 1. SAFETY LOCK
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // ==========================================
    // CONFIGURATION
    // ==========================================

    // 1. BLOCKED LIST (Junk to hide/remove)
    const BLOCKED_SELECTORS = [
        // Headers & Footers (Safe to hide)
        '.AYaHeader', '.under-header', '.SectionsRelated', '.SearchForm', '.copyRight', '.footerBox',
        // Ad Containers
        '.con_Ad', '.code-block', '#dream7-01', '.article-ads',
        // Ads & Banners
        '#adsx', '.AlbaE3lan', '#aplr-notic', '#id-custom_banner',
        '.ad', '.ads', '.advertisement', '.banner', '.social-share',
        'ins.adsbygoogle', '[id*="google_ads"]', '[class*="google_ads"]',
        '.float-ad', '.fixed-ad', '.ad-box', '.ad_box', '.popunder', '.popup-overlay'
    ].join(', ');

    // 2. SAFE LIST (CRITICAL: These are FORCED to show without breaking layout)
    const SAFE_SELECTORS = [
        '.singleـwrapper',
        '.single_wrapper',
        '.single_content',
        '.postContent',
        '.entry-content',
        '.single_main',
        '.single_info',
        '.trailer-player-container',
        '.trailer-player-box',
        'video',
        '.watch-modal',
        '#player-modal',
        '#content', '.content', '.main', '.container'
    ].join(', ');

    // Anti-Popunder & Clickjacking Engine
    (function hijackPopups() {
        const nativeOpen = window.open;
        window.open = function (url, target, features) {
            if (url && (url.includes('do=download') || url.includes('download') || url.includes('.mp4') || url.includes('.m3u8') || url.includes('blob:'))) {
                return nativeOpen.apply(this, arguments);
            }
            console.warn('[AdBlocker] Blocked popup to:', url);
            return null;
        };

        const nativeAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, listener, options) {
            if (type === 'click' && (this === window || this === document || this === document.body)) {
                const fnStr = listener ? listener.toString() : '';
                if (fnStr.includes('open') || fnStr.includes('location') || fnStr.includes('pop') || fnStr.includes('madurird') || fnStr.includes('dtscout')) {
                    return;
                }
            }
            return nativeAddEventListener.apply(this, arguments);
        };
    })();

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
            
            /* 2. FORCE SHOW CONTENT (Visibility safe - won't collapse layout) */
            ${SAFE_SELECTORS} {
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* 3. PLAYER & IFRAME FIXES */
            .modal, .popup, .overlay, .lightbox, #player-modal, .trailer-player-container, iframe {
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* 4. BUTTON MANAGER */
            #btnDown, .single-download-btn { 
                display: inline-flex !important; 
                visibility: visible !important; 
                opacity: 1 !important;
            } 
            #btnWatch, .single-watch-btn { 
                display: inline-flex !important; 
                visibility: visible !important; 
                opacity: 1 !important;
                cursor: pointer !important;
            }

            /* 5. BODY OPTIMIZATION - FORCE VISIBILITY */
            body, html {
                overflow-x: hidden !important;
                background-color: #111 !important; 
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    // ==========================================
    // MODULE 2: RADICAL CLEANER (DOM Removal)
    // ==========================================
    function cleanJunk() {
        requestAnimationFrame(() => {
            // 1. Remove ad iframes and scripts completely
            const trash = document.querySelectorAll(
                'iframe[src*="ads"], script[src*="ads"], .ad, .ads, ' +
                'script[src*="madurird"], script[src*="esheaq"], script[src*="dtscout"], script[src*="popads"], script[src*="popcash"], ' +
                'iframe[src*="madurird"], iframe[src*="esheaq"], iframe[src*="dtscout"], iframe[src*="popads"]'
            );
            trash.forEach(el => el.remove());

            // 2. Remove High Z-Index Click-Jacking Overlays (Protecting Players)
            const highZ = document.querySelectorAll('.con_search, #search, [style*="z-index"]');
            highZ.forEach(el => {
                if (el.classList.contains('trailer-player-container') || el.classList.contains('overlay-box-container') || el.querySelector('video') || el.querySelector('iframe')) {
                    return; // Preserve player
                }
                const style = window.getComputedStyle(el);
                if (parseInt(style.zIndex) > 5000 && !el.className.includes('modal') && !el.className.includes('player') && !el.innerText.trim()) {
                    el.remove(); // Nuke it
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

                    // 2. Kill Ads
                    if (node.tagName === 'IFRAME' && node.src.includes('ads')) node.remove();

                    // Block specific ad networks on sight
                    if ((node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') &&
                        (node.src.includes('madurird') || node.src.includes('esheaq') || node.src.includes('dtscout') || node.src.includes('popads'))) {
                        node.remove();
                    }

                    if (node.matches && node.matches(BLOCKED_SELECTORS)) node.remove();

                    // 3. Hijack Buttons safely
                    if (node.querySelector && node.querySelector('#btnWatch')) forceWatchToDownload();
                });
            });
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 5: FORCE WATCH -> DOWNLOAD 
    // ==========================================
    function forceWatchToDownload() {
        const watchBtn = document.getElementById('btnWatch') || document.querySelector('.single-watch-btn');
        const downBtn = document.getElementById('btnDown') || document.querySelector('.single-download-btn');

        if (watchBtn && downBtn && !watchBtn.dataset.hijacked) {
            watchBtn.dataset.hijacked = "true";

            watchBtn.addEventListener('click', function (e) {
                const downloadUrl = downBtn.href;

                // 1. Open Download (New Tab) if available
                if (downloadUrl && downloadUrl.includes('http')) {
                    window.open(downloadUrl, '_blank');
                }

                // 2. Allow normal watch click / navigation without breaking AJAX
            }, false);
        }
    }

    // ==========================================
    // MODULE 6: RESCUE MODE (Anti-White Screen)
    // ==========================================
    function startRescueInterval() {
        // Runs every 1.5 second to fight back against white screens
        setInterval(() => {
            // 1. Force Body/HTML visibility safely
            if (document.body && (document.body.style.display === 'none' || document.body.style.visibility === 'hidden' || document.body.style.opacity === '0')) {
                document.body.style.display = 'block';
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
                document.body.style.backgroundColor = '#111';
            }

            // 2. Look for "White Overlays" (Full screen ad covers)
            const overlays = document.querySelectorAll('div, section, span');
            overlays.forEach(el => {
                if (el.classList.contains('trailer-player-container') || el.classList.contains('overlay-box-container')) return;
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' && style.zIndex > 10000 && style.height === window.innerHeight + 'px') {
                    // It's a full screen overlay - if it's not our player, burn it.
                    if (!el.querySelector('video') && !el.querySelector('iframe') && !el.className.includes('modal') && !el.className.includes('player')) {
                        el.remove();
                    }
                }
            });

            // 3. Ensure we didn't accidentally hide the content wrapper
            const wrappers = document.querySelectorAll('.singleـwrapper, .single_content, .postContent, .single_main');
            wrappers.forEach(el => {
                if (el.style.display === 'none') el.style.display = 'block';
            });

        }, 1500);
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
            startRescueInterval();

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log("Safe Optimization + Rescue Mode Loaded");
        } catch (e) {
            console.error("Error:", e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
