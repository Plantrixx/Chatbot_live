document.addEventListener('DOMContentLoaded', () => {
    // 🛡️ 1. Authentication Check
    if (sessionStorage.getItem('agency_logged_in') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // 👤 2. Set User Info
    const userName = sessionStorage.getItem('user_name') || 'Admin';
    document.getElementById('user-display-name').textContent = userName;

    // 🚪 3. Logout Logic
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    // 🧭 4. View Switching Logic
    const navDashboard = document.getElementById('nav-dashboard');
    const navTeam = document.getElementById('nav-team');
    const dashboardView = document.getElementById('dashboard-view');
    const teamView = document.getElementById('team-view');

    function switchView(view) {
        if (view === 'dashboard') {
            dashboardView.style.display = 'block';
            teamView.style.display = 'none';
            navDashboard.classList.add('active');
            navTeam.classList.remove('active');
            fetchClients();
        } else {
            dashboardView.style.display = 'none';
            teamView.style.display = 'block';
            navDashboard.classList.remove('active');
            navTeam.classList.add('active');
            fetchTeam();
        }
    }

    navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); });
    navTeam.addEventListener('click', (e) => { e.preventDefault(); switchView('team'); });

    // 🤖 5. Client Management Logic (Supabase)
    const clientGrid = document.getElementById('client-grid');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const botForm = document.getElementById('bot-form');

    const embedOverlay = document.getElementById('embed-overlay');
    const closeEmbedBtn = document.getElementById('close-embed-btn');
    const embedCodeDisplay = document.getElementById('embed-code');
    const copyBtn = document.getElementById('copy-btn');

    async function fetchClients() {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Supabase Error:', error);
            clientGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 100px; color: #ef4444;">Error loading clients. Please ensure you ran the SQL setup script.</div>';
            return;
        }
        renderClients(data);
    }

    function renderClients(clients) {
        clientGrid.innerHTML = '';
        if (!clients || clients.length === 0) {
            clientGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 100px; color: var(--text-dim);">No bots created yet. Start by building your first AI bot!</div>';
            return;
        }

        clients.forEach(client => {
            const card = document.createElement('div');
            card.className = 'client-card';
            card.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: center; margin-bottom:  profile15px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: ${client.theme_color || '#6366f1'}; border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        ${client.bot_avatar_url ? `<img src="${client.bot_avatar_url}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:10px;">AI</span>'}
                    </div>
                    <div style="flex:1;">
                        <h3 style="margin:0;">${client.name}</h3>
                        <p style="margin:0; font-size:12px; color:var(--text-dim);">${client.bot_name}</p>
                    </div>
                </div>
                <p style="font-size:13px; color:var(--text-dim);">Website: <a href="${client.website_url}" target="_blank" style="color: var(--primary); text-decoration: none;">${client.website_url || 'Not set'}</a></p>
                <p style="font-size:13px; color:var(--text-dim);">Knowledge: ${client.kb ? '📁 Uploaded' : '🌐 None'}</p>
                <div class="card-footer">
                    <button class="btn-outline" onclick="window.getEmbedCode('${client.id}')">Code</button>
                    <button class="btn-outline" onclick="window.deleteClient('${client.id}')" style="color: #ef4444;">Delete</button>
                </div>
            `;
            clientGrid.appendChild(card);
        });
    }

    window.deleteClient = async (id) => {
        if (confirm('Bist du sicher?')) {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (!error) fetchClients();
        }
    };

    window.getEmbedCode = (id) => {
        // Build the Iframe Loader Code using embed.js
        const loaderScriptUrl = window.location.origin + '/widget/embed.js';

        const code = `<!-- BotManager Pro: AI Chatbot Embed -->
<script src="${loaderScriptUrl}" data-client-id="${id}"></script>`;

        embedCodeDisplay.textContent = code;
        embedOverlay.style.display = 'flex';
    };

    botForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientData = {
            name: document.getElementById('client-name').value,
            bot_name: document.getElementById('bot-display-name').value,
            website_url: document.getElementById('client-website').value,
            kb: document.getElementById('knowledge-base').value,
            openai_key: document.getElementById('client-openai-key').value,
            theme_color: document.getElementById('theme-color').value,
            bot_avatar_url: document.getElementById('bot-avatar-url').value
        };

        const { data, error } = await supabase.from('clients').insert([clientData]).select();

        if (!error) {
            fetchClients();
            modalOverlay.style.display = 'none';
            botForm.reset();
            window.getEmbedCode(data[0].id);
        } else {
            alert('Fehler beim Speichern: ' + error.message);
        }
    });

    openModalBtn.addEventListener('click', () => modalOverlay.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => modalOverlay.style.display = 'none');
    closeEmbedBtn.addEventListener('click', () => embedOverlay.style.display = 'none');

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(embedCodeDisplay.textContent);
        copyBtn.textContent = 'Kopiert!';
        setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
    });

    // 👥 6. Team Management Logic
    const teamTableBody = document.getElementById('team-table-body');
    const openTeamModalBtn = document.getElementById('open-team-modal-btn');
    const closeTeamModalBtn = document.getElementById('close-team-modal-btn');
    const teamModalOverlay = document.getElementById('team-modal-overlay');
    const teamForm = document.getElementById('team-form');

    async function fetchTeam() {
        const { data, error } = await supabase.from('team').select('*').order('created_at', { ascending: true });
        if (!error) renderTeam(data);
    }

    function renderTeam(team) {
        teamTableBody.innerHTML = '';
        if (!team) return;

        team.forEach(member => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            tr.innerHTML = `
                <td style="padding: 15px;">${member.name}</td>
                <td style="padding: 15px; color: var(--text-dim);">${member.email}</td>
                <td style="padding: 15px;"><span style="background: rgba(124, 58, 237, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 99px; font-size: 11px;">${member.role}</span></td>
                <td style="padding: 15px; text-align: right;">
                    ${member.role !== 'Owner' ? `<button onclick="window.removeMember('${member.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px;">Entfernen</button>` : ''}
                </td>
            `;
            teamTableBody.appendChild(tr);
        });
    }

    window.removeMember = async (id) => {
        if (confirm('Mitarbeiter entfernen?')) {
            const { error } = await supabase.from('team').delete().eq('id', id);
            if (!error) fetchTeam();
        }
    };

    teamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const memberData = {
            name: document.getElementById('member-name').value,
            email: document.getElementById('member-email').value,
            role: document.getElementById('member-role').value,
        };

        const { error } = await supabase.from('team').insert([memberData]);
        if (!error) {
            fetchTeam();
            teamModalOverlay.style.display = 'none';
            teamForm.reset();
        }
    });

    openTeamModalBtn.addEventListener('click', () => teamModalOverlay.style.display = 'flex');
    closeTeamModalBtn.addEventListener('click', () => teamModalOverlay.style.display = 'none');

    // Initial Fetch
    fetchClients();
});
