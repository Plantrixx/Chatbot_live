(function () {
    const isIframeMode = window.location.pathname.endsWith('widget.html');
    const clientId = new URLSearchParams(window.location.search).get('id');

    if (!isIframeMode || !clientId) return;

    let clientConfig = null;

    async function init() {
        // Fetch client from Supabase
        const { data, error } = await supabase.from('clients').select('*').eq('id', clientId).single();
        if (error || !data) return console.error('BotManager: Configuration not found');

        clientConfig = data;

        // Notify parent (embed.js) about branding
        window.parent.postMessage({
            type: 'botmanager-config',
            config: {
                theme_color: clientConfig.theme_color,
                bot_avatar_url: clientConfig.bot_avatar_url
            }
        }, '*');

        renderUI();
    }

    function renderUI() {
        const app = document.getElementById('ai-chatbot-widget');
        const themeColor = clientConfig.theme_color || '#6366f1';

        app.innerHTML = `
            <div class="chat-container active">
                <style>
                    :root { --primary: ${themeColor}; }
                    .chat-header { background: ${themeColor}; }
                    .message.bot { background: rgba(255,255,255,0.05); }
                    .message.user { background: ${themeColor}; color: white; }
                    .send-btn { color: ${themeColor}; }
                </style>
                <div class="chat-header">
                    <div class="bot-info">
                        <img src="${clientConfig.bot_avatar_url || 'avatar.png'}" alt="Bot">
                        <h3>${clientConfig.bot_name}</h3>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <div class="typing" id="typing-indicator" style="display: none;">
                    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Nachricht schreiben..." autocomplete="off">
                    <button class="send-btn" id="send-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const messagesSection = document.getElementById('chat-messages');

        function addMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${sender}`;
            msgDiv.innerText = text;
            messagesSection.appendChild(msgDiv);
            messagesSection.scrollTop = messagesSection.scrollHeight;
        }

        async function handleSend() {
            const text = input.value.trim();
            if (!text) return;
            addMessage(text, 'user');
            input.value = '';

            const typing = document.getElementById('typing-indicator');
            typing.style.display = 'flex';
            messagesSection.scrollTop = messagesSection.scrollHeight;

            try {
                const response = await getOpenAIResponse(text);
                typing.style.display = 'none';
                addMessage(response, 'bot');
            } catch (error) {
                typing.style.display = 'none';
                addMessage("Entschuldigung, ich konnte die Antwort nicht abrufen.", 'bot');
            }
        }

        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => e.key === 'Enter' && handleSend());

        addMessage(`Hallo! Ich bin ${clientConfig.bot_name}. Wie kann ich Ihnen bei ${clientConfig.name} helfen?`, 'bot');
    }

    async function getOpenAIResponse(userInput) {
        const apiKey = clientConfig.openai_key || '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';

        // STRICT SYSTEM PROMPT
        const systemPrompt = `
            Du bist ${clientConfig.bot_name}, ein spezialisierter KI-Assistent für "${clientConfig.name}".
            
            WICHTIG (DEIN WISSEN):
            Du darfst AUSSCHLIESSLICH die folgende Knowledge Base nutzen, um Informationen über das Unternehmen, Services, Preise oder Abläufe zu geben.
            
            KNOWLEDGE BASE:
            ---
            ${clientConfig.kb || 'Keine spezifischen Daten hinterlegt. Antworte allgemein und höflich im Namen des Unternehmens.'}
            ---
            
            REGELN:
            1. Wenn eine Information NICHT in der Knowledge Base steht, sage höflich, dass du das nicht weißt.
            2. Erfinde niemals Fakten (Halluzinationen vermeiden).
            3. Bleibe immer professionell und freundlich.
            4. Antworte auf Deutsch.
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userInput }
                ],
                temperature: 0.3 // Lower temperature for more accuracy
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    init();
})();
