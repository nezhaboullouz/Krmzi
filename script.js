function hideElements() {
            try {
                // Hide specific header and ad elements
                var specificElements = document.querySelectorAll('.AYaHeader, .under-header, #adsx, .AlbaE3lan, #aplr-notic, header, .footer, .avp-body, .SectionsRelated, .SearchForm, #headerNav, footer, .module_single_sda');
                specificElements.forEach(function(element) {
                    if (element) {
                        element.style.display = 'none';
                        element.remove();
                    }
                });

                // Hide avp-player-ui elements
                var avpPlayerUi = document.querySelectorAll('avp-player-ui');
                avpPlayerUi.forEach(function(element) {
                    element.style.display = 'none';
                });
                
                // Hide Google AdSense ads
                var adsbyGoogle = document.querySelectorAll('ins.adsbygoogle');
                adsbyGoogle.forEach(function(ad) {
                    ad.style.display = 'none';
                });
                
                // Hide custom banner
                var customBanner = document.querySelector('#id-custom_banner');
                if (customBanner) customBanner.style.display = 'none';

                // Hide advertisement elements
                var ads = document.querySelectorAll('.ad, .ads, .advertisement, .adsbygoogle, [id*="ad-"], [class*="ad-"], [id*="google_ads"], [class*="google_ads"], iframe[src*="ads"], .banner, .social-share, .share-buttons');
                ads.forEach(function(element) {
                    if (element) element.style.display = 'none';
                });
                
                // Enhanced popup blocking - comprehensive selectors
                var popups = document.querySelectorAll('.popup, .modal, .cookie-notice, .cookie-banner, .newsletter-popup, #gdpr, .gdpr, [class*="cookie"], [id*="cookie"], .overlay, .lightbox, .dialog, .popover, .tooltip, [class*="popup"], [id*="popup"], [class*="modal"], [id*="modal"], [class*="overlay"], [id*="overlay"], [class*="lightbox"], [id*="lightbox"], [class*="dialog"], [id*="dialog"], [class*="popover"], [id*="popover"], [class*="tooltip"], [id*="tooltip"]');
                popups.forEach(function(element) {
                    if (element) {
                        element.style.display = 'none';
                        element.remove();
                    }
                });
                
                // Block iframe popups and ads
                var iframes = document.querySelectorAll('iframe[src*="ads"], iframe[src*="popup"], iframe[src*="banner"], iframe[src*="ad"], iframe[src*="tracker"], iframe[src*="analytics"]');
                iframes.forEach(function(iframe) {
                    if (iframe) {
                        iframe.style.display = 'none';
                        iframe.remove();
                    }
                });
                
                // Block script tags that might inject ads
                var scripts = document.querySelectorAll('script[src*="ads"], script[src*="popup"], script[src*="banner"], script[src*="tracker"], script[src*="analytics"]');
                scripts.forEach(function(script) {
                    if (script) {
                        script.remove();
                    }
                });
                
                // Block divs with inline styles that look like popups
                var inlinePopups = document.querySelectorAll('div[style*="position: fixed"], div[style*="position:fixed"], div[style*="z-index: 999"], div[style*="z-index:999"], div[style*="z-index: 9999"], div[style*="z-index:9999"], div[style*="z-index: 99999"], div[style*="z-index:99999"]');
                inlinePopups.forEach(function(element) {
                    if (element && (element.style.zIndex > 1000 || element.style.position === 'fixed')) {
                        element.style.display = 'none';
                        element.remove();
                    }
                });
                
                // Block elements with high z-index that might be popups
                var highZIndexElements = document.querySelectorAll('*');
                highZIndexElements.forEach(function(element) {
                    var computedStyle = window.getComputedStyle(element);
                    var zIndex = parseInt(computedStyle.zIndex);
                    if (zIndex > 1000 && (element.tagName === 'DIV' || element.tagName === 'SPAN' || element.tagName === 'SECTION')) {
                        element.style.display = 'none';
                        element.remove();
                    }
                });
                
                // Add custom styles for better mobile view
                var style = document.createElement('style');
                style.innerHTML = `
                    body { 
                        padding: 0 !important; 
                        margin: 0 !important;
                        overflow-x: hidden !important;
                    }
                    .main-content, 
                    .content,
                    #content,
                    .container,
                    .site-content { 
                        padding: 0 !important; 
                        margin: 0 auto !important;
                        max-width: 100% !important;
                    }
                    iframe {
                        max-width: 100% !important;
                        margin: 0 auto !important;
                    }
                    video {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                    /* Hide specific elements with CSS */
                    .AYaHeader,
                    .under-header,
                    #adsx,
                    .AlbaE3lan,
                    #aplr-notic,
                    avp-player-ui,
                    ins.adsbygoogle,
                    #id-custom_banner,
                    [id="aplr-notic"],
                    #headerNav,
                    footer,
                    .module_single_sda,
                    /* Enhanced popup blocking CSS */
                    .popup, .modal, .cookie-notice, .cookie-banner, .newsletter-popup, #gdpr, .gdpr,
                    [class*="cookie"], [id*="cookie"], .overlay, .lightbox, .dialog, .popover, .tooltip,
                    [class*="popup"], [id*="popup"], [class*="modal"], [id*="modal"], [class*="overlay"], [id*="overlay"],
                    [class*="lightbox"], [id*="lightbox"], [class*="dialog"], [id*="dialog"], [class*="popover"], [id*="popover"],
                    [class*="tooltip"], [id*="tooltip"], iframe[src*="ads"], iframe[src*="popup"], iframe[src*="banner"],
                    iframe[src*="ad"], iframe[src*="tracker"], iframe[src*="analytics"] {
                        display: none !important;
                        height: 0 !important;
                        min-height: 0 !important;
                        max-height: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: hidden !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                        position: absolute !important;
                        z-index: -9999 !important;
                        visibility: hidden !important;
                        width: 0 !important;
                        max-width: 0 !important;
                        min-width: 0 !important;
                    }
                    
                    /* Block any element with high z-index that might be a popup */
                    div[style*="position: fixed"], div[style*="position:fixed"],
                    div[style*="z-index: 999"], div[style*="z-index:999"],
                    div[style*="z-index: 9999"], div[style*="z-index:9999"],
                    div[style*="z-index: 99999"], div[style*="z-index:99999"] {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                    }
                `;
                document.head.appendChild(style);

                // Notify Swift that JavaScript has been executed
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.jsLoaded) {
                    window.webkit.messageHandlers.jsLoaded.postMessage('loaded');
                }
            } catch (error) {
                console.error('Error in hideElements:', error);
            }
        }
        
        // Continuous popup monitoring and blocking
        function setupPopupMonitoring() {
            try {
                // Create a more aggressive observer for popups
                var popupObserver = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                                // Check if the added node is a popup
                                if (isPopupElement(node)) {
                                    console.log('Blocking dynamically added popup:', node);
                                    blockElement(node);
                                }
                                
                                // Check children of added node
                                if (node.querySelectorAll) {
                                    var popupChildren = node.querySelectorAll('*');
                                    popupChildren.forEach(function(child) {
                                        if (isPopupElement(child)) {
                                            console.log('Blocking popup child:', child);
                                            blockElement(child);
                                        }
                                    });
                                }
                            }
                        });
                    });
                });
                
                // Start observing
                popupObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class', 'id']
                });
                
                // Function to check if an element is a popup
                function isPopupElement(element) {
                    if (!element || !element.style) return false;
                    
                    var computedStyle = window.getComputedStyle(element);
                    var zIndex = parseInt(computedStyle.zIndex);
                    var position = computedStyle.position;
                    var display = computedStyle.display;
                    
                    // Check for popup characteristics
                    if (zIndex > 1000) return true;
                    if (position === 'fixed' && zIndex > 100) return true;
                    if (element.classList.contains('popup') || element.classList.contains('modal')) return true;
                    if (element.id && (element.id.includes('popup') || element.id.includes('modal'))) return true;
                    if (element.className && (element.className.includes('popup') || element.className.includes('modal'))) return true;
                    
                    // Check for overlay characteristics
                    if (element.style.position === 'fixed' || element.style.position === 'absolute') {
                        if (element.style.zIndex > 100 || element.style.top === '0px' || element.style.left === '0px') {
                            return true;
                        }
                    }
                    
                    return false;
                }
                
                // Function to block an element
                function blockElement(element) {
                    try {
                        element.style.display = 'none';
                        element.style.visibility = 'hidden';
                        element.style.opacity = '0';
                        element.style.pointerEvents = 'none';
                        element.style.position = 'absolute';
                        element.style.zIndex = '-9999';
                        element.style.width = '0';
                        element.style.height = '0';
                        element.style.overflow = 'hidden';
                        
                        // Remove the element completely
                        if (element.parentNode) {
                            element.parentNode.removeChild(element);
                        }
                    } catch (error) {
                        console.error('Error blocking element:', error);
                    }
                }
                
                // Block any existing popups that might have been missed
                setTimeout(function() {
                    var allElements = document.querySelectorAll('*');
                    allElements.forEach(function(element) {
                        if (isPopupElement(element)) {
                            console.log('Blocking existing popup:', element);
                            blockElement(element);
                        }
                    });
                }, 1000);
                
                // Periodic cleanup
                setInterval(function() {
                    var popups = document.querySelectorAll('.popup, .modal, .overlay, .lightbox, .dialog, [style*="position: fixed"], [style*="z-index: 999"]');
                    popups.forEach(function(popup) {
                        if (popup && popup.style.display !== 'none') {
                            console.log('Periodic popup cleanup:', popup);
                            blockElement(popup);
                        }
                    });
                }, 2000);
                
            } catch (error) {
                console.error('Error in setupPopupMonitoring:', error);
            }
        }
        
        // Global state tracking for video
        var videoStateTracker = {
            isPlaying: false,
            lastStateChange: 0,
            debounceDelay: 1000,
            
            updateState: function(playing) {
                var now = Date.now();
                if (this.isPlaying !== playing && (now - this.lastStateChange) > this.debounceDelay) {
                    this.isPlaying = playing;
                    this.lastStateChange = now;
                    console.log('Video state update (debounced):', playing);
                    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.videoStateChanged) {
                        window.webkit.messageHandlers.videoStateChanged.postMessage(playing);
                    }
                }
            }
        };
        
        function setupVideoMonitoring() {
            try {
                var videos = document.querySelectorAll('video');
                videos.forEach(function(video) {
                    video.setAttribute('playsinline', 'true');
                    video.setAttribute('webkit-playsinline', 'true');
                    video.setAttribute('controls', 'true');
                    
                    video.removeEventListener('play', handleVideoPlay);
                    video.removeEventListener('pause', handleVideoPause);
                    video.removeEventListener('ended', handleVideoEnded);
                    
                    video.addEventListener('play', handleVideoPlay);
                    video.addEventListener('pause', handleVideoPause);
                    video.addEventListener('ended', handleVideoEnded);
                    
                    video.addEventListener('webkitbeginfullscreen', function() {
                        console.log('Video entering fullscreen');
                    });
                    
                    video.addEventListener('webkitendfullscreen', function() {
                        console.log('Video exiting fullscreen');
                        setTimeout(function() {
                            if (!video.paused && video.currentTime > 0 && !video.ended) {
                                videoStateTracker.updateState(true);
                            }
                        }, 500);
                    });
                });
                
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) {
                                var newVideos = [];
                                if (node.tagName === 'VIDEO') {
                                    newVideos = [node];
                                } else if (node.querySelectorAll) {
                                    newVideos = Array.from(node.querySelectorAll('video'));
                                }
                                
                                newVideos.forEach(function(video) {
                                    video.setAttribute('playsinline', 'true');
                                    video.setAttribute('webkit-playsinline', 'true');
                                    video.setAttribute('controls', 'true');
                                    
                                    video.addEventListener('play', handleVideoPlay);
                                    video.addEventListener('pause', handleVideoPause);
                                    video.addEventListener('ended', handleVideoEnded);
                                });
                            }
                        });
                    });
                });
                
                observer.observe(document.body, { childList: true, subtree: true });
            } catch (error) {
                console.error('Error in setupVideoMonitoring:', error);
            }
        }
        
        function handleVideoPlay(event) {
            console.log('Video play event');
            videoStateTracker.updateState(true);
        }
        
        function handleVideoPause(event) {
            var video = event.target;
            if (video.ended || video.currentTime === 0) {
                console.log('Video pause event (legitimate)');
                videoStateTracker.updateState(false);
            } else {
                console.log('Video pause event (ignored - likely automatic)');
            }
        }
        
        function handleVideoEnded(event) {
            console.log('Video ended event');
            videoStateTracker.updateState(false);
        }
        
        function preventVideoPausing() {
            try {
                document.addEventListener('visibilitychange', function() {
                    if (!document.hidden) {
                        var videos = document.querySelectorAll('video');
                        videos.forEach(function(video) {
                            if (video.readyState >= 2 && video.currentTime > 0 && !video.ended && video.paused) {
                                console.log('Resuming video after visibility change');
                                video.play().catch(function(error) {
                                    console.log('Could not resume video:', error);
                                });
                            }
                        });
                    }
                });
                
                window.addEventListener('focus', function() {
                    var videos = document.querySelectorAll('video');
                    videos.forEach(function(video) {
                        if (video.readyState >= 2 && video.currentTime > 0 && !video.ended && video.paused) {
                            console.log('Resuming video after window focus');
                            video.play().catch(function(error) {
                                console.log('Could not resume video:', error);
                            });
                        }
                    });
                });
                
                var originalPause = HTMLVideoElement.prototype.pause;
                HTMLVideoElement.prototype.pause = function() {
                    if (this.ended || this.currentTime === 0 || this.dataset.userPaused === 'true') {
                        console.log('Allowing video pause');
                        originalPause.call(this);
                    } else {
                        console.log('Preventing automatic video pause');
                    }
                };
                
                document.addEventListener('click', function(event) {
                    if (event.target.tagName === 'VIDEO' || event.target.closest('video')) {
                        var video = event.target.tagName === 'VIDEO' ? event.target : event.target.closest('video');
                        if (video && !video.paused) {
                            video.dataset.userPaused = 'true';
                            setTimeout(function() {
                                delete video.dataset.userPaused;
                            }, 1000);
                        }
                    }
                });
                
            } catch (error) {
                console.error('Error in preventVideoPausing:', error);
            }
        }
        
        // Run functions
        hideElements();
        setupVideoMonitoring();
        preventVideoPausing();
        setupPopupMonitoring(); // Call the new function here
        
        setTimeout(function() {
            hideElements();
            setupVideoMonitoring();
            preventVideoPausing();
            setupPopupMonitoring(); // Call the new function here
        }, 2000);
        
        var observer = new MutationObserver(function() {
            hideElements();
            setupVideoMonitoring();
            setupPopupMonitoring(); // Call the new function here
        });
        observer.observe(document.body, { childList: true, subtree: true });
