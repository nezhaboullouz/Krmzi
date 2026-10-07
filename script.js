/* ============================================================================
 * Krmzi App — WebView All-in-One script
 * ----------------------------------------------------------------------------
 * PART A — Sayyarh ads-page skipper:
 *   krmzi.org routes episode links through an ads interstitial:
 *       https://sayyarh.com/latest1501?url=<base64(episode_url)>
 *   The interstitial forces: click play -> watch video ad -> click continue.
 *   This part decodes the base64 locally and jumps STRAIGHT to the episode.
 *
 * PART B — Page optimizer / ad-blocker (your existing script):
 *   hides headers/footers/ads, removes ad iframes & scripts, enhances
 *   <video> (playsinline, anti-auto-pause), hijacks watch buttons,
 *   rescue mode against white screens.
 *
 * USAGE (iOS / WKWebView) — replaces the old script completely:
 *   let script = WKUserScript(
 *       source: try! String(contentsOfFile: Bundle.main.path(forResource: "krmzi_app_webview_full", ofType: "js")!),
 *       injectionTime: .atDocumentStart,
 *       forMainFrameOnly: false)
 *   webView.configuration.userContentController.addUserScript(script)
 *
 * Optional Swift complement (WKNavigationDelegate): if a navigation targets
 * sayyarh.com, cancel it and load window.__krmziDirect(url) instead.
 * ========================================================================== */
(function () {
    // 1. SAFETY LOCK (covers both the old script name and this one)
    if (window.__optimizationScriptActive || window.__krmziAllInOneActive) return;
    window.__optimizationScriptActive = true;
    window.__krmziAllInOneActive = true;

    // ==========================================
    // PART A: SAYYARH SKIP (runs immediately, no DOM needed)
    // ==========================================
    var AD_HOST = /(^|\.)sayyarh\.com$/i;

    /* Decode "https://sayyarh.com/latest1501?url=<base64>" -> direct URL. */
    function krmziDirectTarget(adUrl) {
        try {
            var u = new URL(adUrl, window.location.href);
            var b64 = u.searchParams.get('url');
            if (!b64) return null;
            var std = b64.replace(/-/g, '+').replace(/_/g, '/');
            while (std.length % 4) std += '=';
            var bin = atob(std);
            var bytes = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            var decoded = new TextDecoder('utf-8').decode(bytes);
            try { decoded = decodeURIComponent(decoded); } catch (e) { /* already plain */ }
            return decoded;
        } catch (e) {
            return null;
        }
    }
    // Exposed for Swift: window.__krmziDirect('https://sayyarh.com/...') -> direct URL
    window.__krmziDirect = krmziDirectTarget;

    // If we landed ON the ads page -> jump straight to the episode, skip the video ad.
    if (AD_HOST.test(window.location.hostname)) {
        var adTarget = krmziDirectTarget(window.location.href);
        if (adTarget) {
            window.location.replace(adTarget);
            return; // nothing else to do on the ads page
        }
    }

    /* Rewrite sayyarh ad-links inside krmzi.org pages to direct episode URLs. */
    function fixKrmziLinks(root) {
        try {
            var scope = root && root.querySelectorAll ? root : document;
            var links = scope.querySelectorAll('a[href*="sayyarh.com"]');
            for (var i = 0; i < links.length; i++) {
                var a = links[i];
                if (a.dataset.krmziFixed) continue;
                var d = krmziDirectTarget(a.getAttribute('href'));
                if (d) {
                    a.setAttribute('href', d);
                    a.dataset.krmziFixed = '1';
                }
            }
        } catch (e) { /* DOM not ready */ }
    }

    // ==========================================
    // PART B: CONFIGURATION (ad-blocker)
    // ==========================================

    // 1. BLOCKED LIST (Junk to hide/remove)
    // Removed risky selectors like .page-cntn, .article-wrap, etc.
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
                'script[src*="madurird"], script[src*="dtscout"], ' + // NEW: Block ad networks
                'iframe[src*="madurird"], iframe[src*="dtscout"]'
            );
            trash.forEach(el => el.remove());

            // 2. Remove High Z-Index Click-Jacking Overlays
            const highZ = document.querySelectorAll('.con_search, #search, [style*="z-index"]');
            highZ.forEach(el => {
                const style = window.getComputedStyle(el);
                if (parseInt(style.zIndex) > 5000 && !el.className.includes('modal') && !el.className.includes('player')) {
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

                    // NEW: Block specific ad networks on sight
                    if ((node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') &&
                        (node.src.includes('madurird') || node.src.includes('dtscout'))) {
                        node.remove();
                    }

                    if (node.matches && node.matches(BLOCKED_SELECTORS)) node.remove();

                    // 2b. Rewrite sayyarh ad-links added dynamically (Part A)
                    if (node.querySelectorAll) fixKrmziLinks(node);
                    if (node.tagName === 'A' && node.href && node.href.includes('sayyarh.com')) fixKrmziLinks(node.parentNode || document);

                    // 3. Hijack Buttons
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
                if (downloadUrl) window.open(downloadUrl, '_blank');

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
        // Runs every 1.5 second to fight back against white screens
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
                    // It's a full screen overlay - if it's not our player, burn it.
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
    // INIT
    // ==========================================
    function init() {
        try {
            injectSuperStyles();
            cleanJunk();
            forceWatchToDownload();
            fixKrmziLinks(document); // Part A: rewrite sayyarh links on load
            document.querySelectorAll('video').forEach(enhanceVideo);
            startMonitoring();
            startRescueInterval(); // Start the white screen fighter

            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log("Krmzi All-in-One (Sayyarh skip + Safe Optimization + Rescue Mode) Loaded");
        } catch (e) {
            console.error("Error:", e);
        }
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
