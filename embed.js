(function () {
    const scriptTag = document.currentScript || document.querySelector('script[data-client-id]');
    const clientId = scriptTag.getAttribute('data-client-id');
    const baseUrl = scriptTag.src.split('/').slice(0, -1).join('/'); // Path to the widget folder
    const widgetUrl = `${baseUrl}/widget.html?id=${clientId}`;

    if (!clientId) return console.error('BotManager: Missing Client ID');

    // Styles for the Iframe & FAB
    const style = document.createElement('style');
    style.textContent = `
        #botmanager-iframe-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            height: 600px;
            max-height: 80vh;
            max-width: 90vw;
            z-index: 999999;
            border: none;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateY(20px);
            opacity: 0;
            pointer-events: none;
            background: transparent;
        }
        #botmanager-iframe-container.active { 
            display: block; 
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        #botmanager-fab {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #6366f1; /* Default, will be updated by widget message */
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        #botmanager-fab:hover { transform: scale(1.1); }
        #botmanager-fab img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
    `;
    document.head.appendChild(style);

    // Create FAB
    const fab = document.createElement('div');
    fab.id = 'botmanager-fab';
    fab.innerHTML = `<img src="${baseUrl}/avatar.png" id="botmanager-fab-img">`;
    document.body.appendChild(fab);

    // Create Iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'botmanager-iframe-container';
    iframe.src = widgetUrl;
    document.body.appendChild(iframe);

    fab.addEventListener('click', () => {
        iframe.classList.toggle('active');
    });

    // Listen for branding updates from the widget
    window.addEventListener('message', (event) => {
        if (event.data.type === 'botmanager-config') {
            const config = event.data.config;
            if (config.theme_color) fab.style.background = config.theme_color;
            if (config.bot_avatar_url) document.getElementById('botmanager-fab-img').src = config.bot_avatar_url;
        }
    });

})();
