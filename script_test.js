(function () {
    'use strict';

    // 1. SAFETY LOCK (Prevent double execution)
    if (window.__3iskkOptimizerActive) return;
    window.__3iskkOptimizerActive = true;

    console.log('[3iskk Optimizer] Initializing Anti-Ad & Site Performance Engine...');

    // ==========================================
    // MODULE 1: ANTI-POPUNDER & CLICKJACKING SHIELD
    // ==========================================
    (function antiPopunderShield() {
        // 1. Block malicious window.open popups
        const nativeOpen = window.open;
        window.open = function (url, target, features) {
            if (url && (url.includes('do=download') || url.includes('download') || url.includes('.mp4') || url.includes('.m3u8') || url.includes('blob:'))) {
                return nativeOpen.apply(this, arguments);
            }
            console.warn('[3iskk Optimizer] Blocked popup attempt to:', url);
            return null;
        };

        // 2. Intercept clickjacking event listeners attached to global objects
        const nativeAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, listener, options) {
            if (type === 'click' && (this === window || this === document || this === document.body)) {
                const fnStr = listener ? listener.toString() : '';
                if (fnStr.includes('window.open') || fnStr.includes('location.href') || fnStr.includes('popunder') || fnStr.includes('madurird') || fnStr.includes('dtscout')) {
                    console.warn('[3iskk Optimizer] Intercepted clickjacking listener');
                    return;
                }
            }
            return nativeAddEventListener.apply(this, arguments);
        };
    })();

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const BLOCKED_SELECTORS = [
        // Headers & Footers (Junk)
        '.AYaHeader', '.under-header', '.SectionsRelated', '.SearchForm', '.copyRight', '.footerBox',
        // Ad Containers & Banners
        '.con_Ad', '.code-block', '#dream7-01', '.article-ads', '#adsx', '.AlbaE3lan', '#aplr-notic',
        '#id-custom_banner', '.ad', '.ads', '.advertisement', '.banner', '.social-share',
        'ins.adsbygoogle', '[id*="google_ads"]', '[class*="google_ads"]',
        '.float-ad', '.fixed-ad', '.ad-box', '.ad_box', '.ad-wrapper', '.popunder', '.popup-overlay'
    ].join(', ');

    const SAFE_SELECTORS = [
        '.single_info',
        '.single_main',
        '.single_main_content',
        '.trailer-player-container',
        '.trailer-player-box',
        '#player-modal',
        '.watch-modal',
        '.item_wrapper',
        'video',
        'iframe[src*="3isk"]',
        'iframe[src*="embed"]'
    ].join(', ');

    // ==========================================
    // MODULE 2: VISUAL STYLING ENGINE (CSS)
    // ==========================================
    function injectSuperStyles() {
        const styleId = 'optimized-3iskk-blocker-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* 1. HIDE AD JUNK */
            ${BLOCKED_SELECTORS} {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                z-index: -9999 !important;
            }
            
            /* 2. PROTECT CRITICAL CONTENT (Anti-White Screen) */
            ${SAFE_SELECTORS} {
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* 3. PLAYER & IFRAME ENHANCEMENTS */
            .modal, .popup, .overlay, #player-modal, .trailer-player-container, iframe {
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* 4. WATCH BUTTON INTEGRITY */
            .single-watch-btn { 
                display: inline-flex !important; 
                visibility: visible !important; 
                opacity: 1 !important;
                cursor: pointer !important;
            }

            /* 5. PAGE ROOT STABILITY */
            body, html {
                overflow-x: hidden !important;
                background-color: #0b0b0b !important; 
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    // ==========================================
    // MODULE 3: RADICAL DOM CLEANER
    // ==========================================
    const AD_DOMAINS = ['madurird', 'esheaq', 'dtscout', 'popads', 'popcash', 'adsterra', 'propellerads', 'monetag', 'exoclick', 'juicyads', '1xbet', 'bet365'];

    function cleanJunkDOM() {
        requestAnimationFrame(() => {
            // 1. Remove Ad Scripts and Iframes by URL
            const scriptsAndIframes = document.querySelectorAll('script[src], iframe[src]');
            scriptsAndIframes.forEach(el => {
                const src = el.src.toLowerCase();
                if (AD_DOMAINS.some(domain => src.includes(domain)) || (el.tagName === 'IFRAME' && src.includes('ads'))) {
                    console.log('[3iskk Optimizer] Removed ad element:', src);
                    el.remove();
                }
            });

            // 2. Remove Transparent Click-Jacking Overlays (High Z-Index Covers)
            const overlays = document.querySelectorAll('div, section, span, a');
            overlays.forEach(el => {
                if (el.classList.contains('trailer-player-container') || el.classList.contains('trailer-player-box') || el.querySelector('video') || el.querySelector('iframe')) {
                    return;
                }

                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' && parseInt(style.zIndex) > 5000 && !el.innerText.trim()) {
                    console.log('[3iskk Optimizer] Nuked transparent click-jacking overlay');
                    el.remove();
                }
            });
        });
    }

    // ==========================================
    // MODULE 4: VIDEO & PLAYER ENHANCER
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
    // MODULE 5: SENTINEL DOM OBSERVER
    // ==========================================
    function startSentinel() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;

                    // Catch dynamic videos
                    if (node.tagName === 'VIDEO') enhanceVideo(node);
                    else if (node.querySelectorAll) node.querySelectorAll('video').forEach(enhanceVideo);

                    // Block dynamic ad elements
                    if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
                        const src = (node.src || '').toLowerCase();
                        if (AD_DOMAINS.some(domain => src.includes(domain)) || (node.tagName === 'IFRAME' && src.includes('ads'))) {
                            node.remove();
                        }
                    }

                    if (node.matches && node.matches(BLOCKED_SELECTORS)) {
                        node.remove();
                    }
                });
            });
        });

        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 6: ANTI-WHITE SCREEN RESCUE INTERVAL
    // ==========================================
    function startRescueInterval() {
        setInterval(() => {
            // Restore Body / HTML visibility
            if (document.body && (document.body.style.display === 'none' || document.body.style.visibility === 'hidden' || document.body.style.opacity === '0')) {
                document.body.style.display = 'block';
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
                document.body.style.backgroundColor = '#0b0b0b';
            }

            cleanJunkDOM();
        }, 1500);
    }

    // ==========================================
    // INIT
    // ==========================================
    function init() {
        try {
            injectSuperStyles();
            cleanJunkDOM();
            document.querySelectorAll('video').forEach(enhanceVideo);
            startSentinel();
            startRescueInterval();

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log('[3iskk Optimizer] Engine Successfully Loaded & Active');
        } catch (e) {
            console.error('[3iskk Optimizer] Initialization Error:', e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
