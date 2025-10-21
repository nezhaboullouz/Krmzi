    // script.js
    
    // Function to hide header and footer elements
    function hideHeaderAndFooter() {
        const style = document.createElement('style');
        style.innerHTML = '#headerNav, footer { display: none !important; }';
        document.head.appendChild(style);
    }
    
   // Function to detect text copy and send a message to the native app
   function setupTextCopyDetection() {
       document.addEventListener('copy', function(e) {
           // Ensure window.webkit.messageHandlers.textCopyHandler exists before posting
           if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.textCopyHandler) {
               window.webkit.messageHandlers.textCopyHandler.postMessage('textCopied');
           }
       });
   }
   
   // Execute functions when the document is ready
   document.addEventListener('DOMContentLoaded', function() {
       hideHeaderAndFooter();
       setupTextCopyDetection();
   });
   
   // Also execute on document end in case DOMContentLoaded fires too early for some content
   window.addEventListener('load', function() {
   hideHeaderAndFooter();
});
