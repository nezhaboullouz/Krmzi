(function fixWebViewNavigation() {
    // 1. نفرضو Referer
    let meta = document.querySelector('meta[name="referrer"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = "referrer";
        document.head.appendChild(meta);
    }
    meta.content = "unsafe-url"; // باش ديما يصيفط الرابط الأصلي

    // 2. نصححو أي Form كيدي للسيرفر ديال الفيديو
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.action && form.action.includes('3isk.icu')) {
            form.setAttribute('target', '_self'); // منع فتح نافذة جديدة
        }
    });

    // 3. نراقبوا الفورميلير يلا تصاوب بالـ JS من بعد (Dynamic)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'FORM' && node.action && node.action.includes('3isk.icu')) {
                    node.setAttribute('target', '_self');
                }
                // نقلبو حتى فوسط العناصر لي تضافت
                if (node.querySelectorAll) {
                    node.querySelectorAll('form').forEach(form => {
                        if (form.action && form.action.includes('3isk.icu')) {
                            form.setAttribute('target', '_self');
                        }
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });

    // 4. intercept click and force target _self
    document.addEventListener('click', function(e) {
        let link = e.target.closest('a');
        if (link && link.target === '_blank') {
            link.target = '_self'; // نردوه يفتح فنفس الصفحة
        }
    }, true);
})();
