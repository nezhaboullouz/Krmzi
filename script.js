(function () {
    // 1. SAFETY LOCK
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // ==========================================
    // CONFIGURATION
    // ==========================================

    // 1. BLOCKED LIST (Only block Header, Comments Section, and Footer)
    const BLOCKED_SELECTORS = [
        'header', '#header', '.main-header',
        '#comments-sec', '.comments-items-sec',
        'footer', '#footer', '.footer'
    ].join(', ');

    // 2. SAFE LIST
    const SAFE_SELECTORS = [
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
            /* 1. HIDE SPECIFIED ELEMENTS (Header, Comments, Footer) */
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
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* 3. PLAYER & IFRAME FIXES */
            .modal, .popup, .overlay, .lightbox, #player-modal {
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* 4. BUTTON MANAGER (Keep natural watch button clickable) */
            #btnWatch, .single-watch-btn, #single_watch_btn { 
                display: inline-flex !important; 
                visibility: visible !important; 
                opacity: 1 !important;
                cursor: pointer !important;
                pointer-events: auto !important;
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
            // Remove targeted elements (Header, Comments Section, Footer)
            const targets = document.querySelectorAll(BLOCKED_SELECTORS);
            targets.forEach(el => el.remove());
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

                    // 2. Kill Blocked Elements
                    if (node.matches && node.matches(BLOCKED_SELECTORS)) node.remove();
                    if (node.querySelectorAll) {
                        node.querySelectorAll(BLOCKED_SELECTORS).forEach(el => el.remove());
                    }
                });
            });
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 5: UNBLOCK WATCH BUTTON FORWARDING
    // ==========================================
    function allowWatchForwarding() {
        // Ensure single-watch-btn navigates cleanly to its destination (e.g. aa.3isk.icu)
        const watchBtns = document.querySelectorAll('#btnWatch, .single-watch-btn, #single_watch_btn');
        watchBtns.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
        });
    }

    // ==========================================
    // MODULE 6: RESCUE MODE (Anti-White Screen)
    // ==========================================
    function startRescueInterval() {
        // Runs every 1.5 second to fight back against white screens
        setInterval(() => {
            // 1. Force Body/HTML visibility
            if (document.body && (document.body.style.display === 'none' || document.body.style.visibility === 'hidden' || document.body.style.opacity === '0')) {
                document.body.style.display = 'block';
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
                document.body.style.backgroundColor = '#111';
            }

            // 2. Remove specified blocked elements if re-created
            cleanJunk();
            allowWatchForwarding();

        }, 1500);
    }

    // ==========================================
    // INIT
    // ==========================================
    function init() {
        try {
            injectSuperStyles();
            cleanJunk();
            allowWatchForwarding();
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
