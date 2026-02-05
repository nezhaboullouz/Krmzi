(function () {
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    /* 
       ================================================================
       🛡️ UBLOCK LITE (JAVASCRIPT EDITION)
       ================================================================
    */

    const ADBLOCK_CONFIG = {
        // Domains to kill at network level
        blockedDomains: [
            'googleads', 'g.doubleclick', 'pagead2', 'adsbygoogle', 'adservice',
            'googlesyndication', 'adnxs', 'criteo', 'taboola', 'outbrain',
            'popads', 'propellerads', 'exoclick', 'juicyads', 'adsterra',
            'vidsp.net/ads', 'tracker', 'analytics', 'facebook.com/tr'
        ],
        // CSS Selectors to hide (Cosmetic Filtering)
        blockedSelectors: [
            '.con_Ad', '.code-block', '#dream7-01', '#dream7-03', '.article-ads',
            '.footerBox', '#adsx', '.AlbaE3lan', '#aplr-notic', '#id-custom_banner',
            '.ad', '.ads', '.advertisement', '.banner', '.social-share',
            'ins.adsbygoogle', '[id*="google_ads"]',
            'div[class*="ads"]', 'div[id*="ads"]', 'div[class*="sponsor"]',
            'iframe[src*="google"]', 'iframe[src*="ads"]'
        ]
    };

    // 1. NETWORK INTERCEPTOR (The Core of uBlock)
    // -------------------------------------------------------------
    function activateNetworkShield() {
        const isAd = (url) => {
            if (!url) return false;
            return ADBLOCK_CONFIG.blockedDomains.some(d => url.toString().includes(d));
        };

        // Hook 1: Block XMLHttpRequests (XHR)
        const realOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (isAd(url)) {
                console.warn(`🛡️ uBlock: Blocked XHR to ${url}`);
                return; // Silent fail
            }
            return realOpen.apply(this, arguments);
        };

        // Hook 2: Block Fetch API
        const realFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = (typeof input === 'string') ? input : input.url;
            if (isAd(url)) {
                console.warn(`🛡️ uBlock: Blocked Fetch to ${url}`);
                return Promise.reject(new Error("Blocked by uBlock Lite"));
            }
            return realFetch.apply(this, arguments);
        };

        // Hook 3: Block Script/Iframe Injection
        const realCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const el = realCreateElement.call(document, tagName);
            if (['script', 'iframe', 'img'].includes(tagName.toLowerCase())) {
                const realSetAttribute = el.setAttribute;
                el.setAttribute = function(name, value) {
                    if (name.toLowerCase() === 'src' && isAd(value)) {
                        console.warn(`🛡️ uBlock: Blocked Element Source ${value}`);
                        return;
                    }
                    realSetAttribute.call(this, name, value);
                };
                // Property setter trap
                Object.defineProperty(el, 'src', {
                    set: function(val) {
                        if (isAd(val)) return;
                        el.setAttribute('src', val);
                    },
                    get: function() { return el.getAttribute('src'); }
                });
            }
            return el;
        };
    }

    // 2. COSMETIC FILTERING (CSS Injection)
    // -------------------------------------------------------------
    function activateCosmeticFilter() {
        const style = document.createElement('style');
        style.innerHTML = `
            ${ADBLOCK_CONFIG.blockedSelectors.join(', ')} {
                display: none !important;
                visibility: hidden !important;
                width: 0 !important; height: 0 !important;
                pointer-events: none !important;
            }
            /* White Screen Fixes */
            body, html { overflow-x: hidden !important; }
            .article-wrap, .page-cntn, .postEmbed { display: block !important; opacity: 1 !important; visibility: visible !important; }
            /* Player Protection */
            .postEmbed iframe { position: relative !important; z-index: 2147483647 !important; }
        `;
        document.head.appendChild(style);
    }

    // 3. GEOMETRIC CLEANER (For overlays that bypass filters)
    // -------------------------------------------------------------
    function geometricClean() {
        const player = document.querySelector('.postEmbed');
        if (!player) return;
        const pRect = player.getBoundingClientRect();
        if (pRect.width < 10) return;

        document.body.querySelectorAll('*').forEach(el => {
            if (el === player || player.contains(el) || el.contains(player)) return;
            if (['HTML','BODY','.article-wrap'].includes(el.tagName) || el.className.includes('container')) return;

            const r = el.getBoundingClientRect();
            // Check intersection (Overlap)
            const overlap = !(r.right < pRect.left || r.left > pRect.right || r.bottom < pRect.top || r.top > pRect.bottom);
            
            if (overlap) {
                const style = window.getComputedStyle(el);
                // Hide if it's a layer on top
                if (style.position === 'absolute' || style.position === 'fixed') {
                    el.style.display = 'none';
                }
            }
        });
    }

    // --- MAIN ---
    function init() {
        try {
            activateNetworkShield();    // Stop requests
            activateCosmeticFilter();   // Hide elements
            setInterval(geometricClean, 1500); // Check overlaps often
            
            // Auto Redirect
            if (!window.location.search.includes('do=watch')) {
                const btn = document.getElementById('btnWatch');
                if (btn) window.location.href = btn.href;
            }

            console.log("🛡️ uBlock Lite Loaded");
            if (window.webkit?.messageHandlers?.jsLoaded) window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
        } catch(e) { console.error(e); }
    }

    if(document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
