(function() {
    // 1. SAFETY LOCK: Prevent the script from running twice and crashing the browser
    if (window.__optimizationScriptActive) return;
    window.__optimizationScriptActive = true;

    // CONFIGURATION: Add any class or ID you want to remove here
    const BLOCKED_SELECTORS = [
        // Headers & Footers
        '.AYaHeader', '.under-header', 'header', '.footer', 'footer', '#headerNav', '.avp-body', 
        '.SectionsRelated', '.SearchForm', '.module_single_sda',
        // Ads & Banners
        '#adsx', '.AlbaE3lan', '#aplr-notic', '#id-custom_banner',
        '.ad', '.ads', '.advertisement', '.banner', '.social-share', 
        'ins.adsbygoogle', '[id*="google_ads"]',
        // Popups & Overlays
        '.popup', '.modal', '.cookie-notice', '#gdpr', '.overlay', '.lightbox',
        'iframe[src*="ads"]', 'iframe[src*="tracker"]'
    ].join(', ');

    // ==========================================
    // MODULE 1: FAST CSS HIDING (GPU ACCELERATED)
    // ==========================================
    function injectSuperStyles() {
        const styleId = 'optimized-blocker-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* Hide known junk immediately */
            ${BLOCKED_SELECTORS} {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                z-index: -9999 !important;
            }
            
            /* Force Mobile Layout */
            body, html {
                overflow-x: hidden !important;
                max-width: 100vw !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            
            /* Make video player responsive */
            video {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // MODULE 2: JUNK REMOVAL (CPU OPTIMIZED)
    // ==========================================
    function cleanJunk() {
        // We use requestAnimationFrame to prevent freezing the UI thread
        requestAnimationFrame(() => {
            // Remove iframes (they consume memory even if hidden)
            const iframes = document.querySelectorAll('iframe[src*="ads"], iframe[src*="pop"]');
            iframes.forEach(el => el.remove());

            // Remove specific scripts
            const badScripts = document.querySelectorAll('script[src*="ads"]');
            badScripts.forEach(el => el.remove());
            
            // Handle stubborn z-index popups (Only check DIVs to save battery)
            const highZ = document.querySelectorAll('div[style*="z-index"], div[style*="position: fixed"]');
            highZ.forEach(el => {
                if (el.style.zIndex > 999 || el.style.position === 'fixed') {
                    // Double check it's not the video player
                    if (!el.querySelector('video') && !el.className.includes('player')) {
                        el.style.display = 'none';
                    }
                }
            });
        });
    }

    // ==========================================
    // MODULE 3: VIDEO PLAYER ENHANCER
    // ==========================================
    function enhanceVideo(video) {
        if (video.dataset.enhanced) return; // Don't process twice
        video.dataset.enhanced = "true";

        // Force Attributes
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('controls', 'true');

        // Prevent Auto-Pause logic
        video.addEventListener('pause', (e) => {
            if (!video.ended && video.currentTime > 0 && !video.pausedByClick) {
                console.log('Blocking auto-pause');
                e.stopImmediatePropagation();
                video.play().catch(() => {});
            }
            video.pausedByClick = false; // Reset flag
        });

        video.addEventListener('click', () => {
            video.pausedByClick = true;
            // Reset flag after 500ms
            setTimeout(() => { video.pausedByClick = false; }, 500);
        });
    }

    // Override the browser's internal pause command
    const originalPause = HTMLVideoElement.prototype.pause;
    HTMLVideoElement.prototype.pause = function() {
        // Only allow pause if the video ended or user clicked
        if (this.ended || this.pausedByClick) {
            originalPause.apply(this, arguments);
        }
    };

    // ==========================================
    // MODULE 4: THE OBSERVER (WATCHES FOR CHANGES)
    // ==========================================
    function startMonitoring() {
        const observer = new MutationObserver((mutations) => {
            let foundNewVideo = false;
            let foundNewJunk = false;

            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return; // Skip text nodes

                    // Check for video
                    if (node.tagName === 'VIDEO') {
                        enhanceVideo(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('video').forEach(enhanceVideo);
                    }

                    // Check for junk (only simple check to save CPU)
                    if (node.tagName === 'IFRAME' || node.matches && node.matches('.popup, .modal')) {
                        foundNewJunk = true;
                    }
                });
            });

            if (foundNewJunk) cleanJunk();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ==========================================
    // MODULE 5: REDIRECTION SKIPPER
    // ==========================================
    function skipRedirects() {
        document.body.addEventListener('click', function(e) {
            let target = e.target;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }

            if (target && target.href) {
                const url = new URL(target.href);
                if (url.hostname.includes('fashny.net')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    
                    const redirectedUrl = url.searchParams.get('url');
                    if (redirectedUrl) {
                        try {
                            const decodedUrl = atob(redirectedUrl);
                            window.location.href = decodedUrl;
                        } catch (error) {
                            console.error('Failed to decode or navigate:', error);
                            window.location.href = target.href; // fallback
                        }
                    }
                }
            }
        }, true); // Use capture phase to catch the event early
    }

    // ==========================================
    // MAIN EXECUTION
    // ==========================================
    function init() {
        try {
            injectSuperStyles();
            cleanJunk();
            skipRedirects();
            
            // Enhance existing videos
            document.querySelectorAll('video').forEach(enhanceVideo);
            
            // Start watching for new content
            startMonitoring();

            // Background Play Enforcer
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    document.querySelectorAll('video').forEach(v => {
                        if (v.paused && !v.ended) v.play().catch(() => {});
                    });
                }
            });

            // Notify App (Swift/Android)
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
            }
            console.log("Device Optimization Loaded Successfully");
        } catch (e) {
            console.error("Optimization Error:", e);
        }
    }

    // Run immediately or wait for body
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();
