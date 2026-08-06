<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DEEP SMS PANEL</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; height: 100vh; }
        #login-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #2b2b40; background-image: url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgFQbdwcLkTvjWRf3R7YiEL8Ilz34jdTNlyqH-EmdXtuyYAnWO_yi0zHR6S2wffvdqqvl7hTbeLjkHAslQ8_FVNFnqs8ohualK8kHwBIO_t4qGI5chM54EChiQs_oMq9Sw86IDVXdtV_5pjT0Re0U1TtrH0UIV6zuzY8KtMGj-ZMKItkYybRKH4c7r0DW9L/s1080/Screenshot_2026-08-03-12-56-28-38_948cd9899890cbd5c2798760b2b95377.jpg'); background-size: cover; background-position: center; }
        .login-card { background-color: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); padding: 30px; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); width: 90%; max-width: 400px; text-align: center; }
        .login-card h2 { color: #111; margin-bottom: 20px; }
        .login-card input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid rgba(255,255,255,0.6); border-radius: 5px; box-sizing: border-box; }
        .login-card button { width: 100%; padding: 12px; background-color: #0056b3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px; }
        #dashboard-wrapper { display: none; height: 100vh; background-color: #f8f9fa; }
        .sidebar { width: 260px; background-color: #343a40; color: white; display: flex; flex-direction: column; }
        .sidebar-header { padding: 20px; text-align: center; font-size: 20px; font-weight: bold; background: #212529; }
        .user-profile-box { padding: 15px 20px; background-color: #3a3f44; border-bottom: 1px solid #495057; display: flex; flex-direction: column; }
        .user-name { font-weight: bold; color: #ffc107; }
        .logout-link { color: #dc3545; cursor: pointer; font-size: 13px; font-weight: bold; margin-top: 5px; }
        .sidebar-menu { list-style: none; padding: 0; margin: 0; flex-grow: 1; }
        .sidebar-menu li { padding: 15px 20px; border-bottom: 1px solid #3a3f44; cursor: pointer; font-size: 15px; }
        .sidebar-menu li:hover { background-color: #495057; }
        .sidebar-menu li.active { background-color: #ffc107; color: #000; font-weight: bold; }
        .main-container { flex-grow: 1; display: flex; flex-direction: column; overflow-y: auto; }
        .top-header { background-color: white; padding: 20px 30px; display: flex; justify-content: space-between; border-bottom: 1px solid #dee2e6; font-size: 18px; font-weight: bold; }
        .content-body { padding: 30px; }
        .panel-section { display: none; }
        .panel-section.active-panel { display: block; }
        .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .data-table th { background-color: #f8f9fa; color: #333; padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6; }
        .data-table td { padding: 15px; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
        .btn-purple { background-color: #6f42c1; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; }
        .btn-purple:hover { background-color: #59359a; }
        .payout-badge { background-color: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000; }
        .modal-box { background: white; width: 400px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .modal-header { padding: 15px 20px; font-size: 20px; font-weight: bold; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; }
        .modal-close { cursor: pointer; font-size: 20px; color: #666; }
        .modal-body { padding: 20px; }
        .modal-body label { display: block; margin-bottom: 5px; color: #555; font-size: 14px; }
        .modal-body input { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .modal-footer { padding: 15px 20px; text-align: right; border-top: 1px solid #dee2e6; background: #f8f9fa; }
        .btn-cancel { background: transparent; border: none; color: #333; font-weight: bold; margin-right: 15px; cursor: pointer; }
        
        /* Manager Inputs */
        .manager-input-row { display: flex; gap: 10px; margin-bottom: 15px; align-items: center; }
        .manager-input-row input[type="text"] { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
    </style>
</head>
<body>

    <!-- LOGIN PAGE -->
    <div id="login-wrapper">
        <div class="login-card">
            <h2>DEEP SMS PANEL 🔑</h2>
            <input type="text" id="username" placeholder="Username" />
            <input type="password" id="password" placeholder="Password" />
            <button onclick="login()">Login</button>
        </div>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard-wrapper">
        <div class="sidebar">
            <div class="sidebar-header">DEEP SMS</div>
            <div class="user-profile-box">
                <span id="display-user-role" class="user-name">User</span>
                <a class="logout-link" onclick="logout()">🔓 Logout</a>
            </div>
            <ul class="sidebar-menu">
                <li id="menu-dashboard" onclick="switchTab('dashboard')">📊 Dashboard</li>
                <li id="menu-ranges" onclick="switchTab('ranges')">📋 Ranges</li>
                <li id="menu-mynumbers" onclick="switchTab('mynumbers')">📱 My Numbers</li>
                <li id="menu-mysms" onclick="switchTab('mysms')">💬 My SMS</li>
                <li id="menu-traffic" onclick="switchTab('traffic')">🚦 Master Traffic</li>
            </ul>
        </div>

        <div class="main-container">
            <div class="top-header">
                <span id="panel-title">Dashboard</span>
                <span id="live-clock"></span>
            </div>
            <div class="content-body">
                
                <div id="dashboard-panel" class="panel-section">
                    <h3>Welcome to the Panel</h3>
                    <p>Navigate using the sidebar to view ranges and live traffic.</p>
                </div>

                <!-- Ranges Panel -->
                <div id="ranges-panel" class="panel-section">
                    
                    <!-- MANAGER UPLOAD SECTION -->
                    <div id="manager-add-range" style="display:none; margin-bottom: 20px; background: white; padding: 20px; border-radius: 8px; border: 2px dashed #6f42c1;">
                        <h4>👑 Add New Range & Upload Numbers</h4>
                        <div class="manager-input-row">
                            <input type="text" id="new-range-name" placeholder="Range Name (e.g. Afghan Telecom)">
                            <input type="text" id="new-range-prefix" placeholder="Prefix (e.g. 9374889)">
                        </div>
                        <div class="manager-input-row">
                            <label style="font-weight:bold; font-size:14px;">Upload Number List (.txt):</label>
                            <input type="file" id="new-range-file" accept=".txt">
                            <button class="btn-purple" onclick="addRangeWithFile()">Add Range</button>
                        </div>
                    </div>

                    <table class="data-table">
                        <thead>
                            <tr><th>Range</th><th>Prefix</th><th>Test Number</th><th>Currency</th><th>Available Qty</th><th>Action</th></tr>
                        </thead>
                        <tbody id="ranges-table-body">
                            <!-- Populated by JS -->
                        </tbody>
                    </table>
                </div>

                <!-- My Numbers Panel -->
                <div id="mynumbers-panel" class="panel-section">
                    <table class="data-table">
                        <thead>
                            <tr><th>Range Name</th><th>Prefix</th><th>Quantity</th><th>Date Claimed</th><th>Action</th></tr>
                        </thead>
                        <tbody id="mynumbers-table-body">
                            <!-- Populated by JS -->
                        </tbody>
                    </table>
                </div>

                <!-- My SMS Panel -->
                <div id="mysms-panel" class="panel-section">
                    <h3>My SMS Traffic (Payout: $0.01/msg)</h3>
                    <div id="mysms-table-container">Loading your data...</div>
                </div>

                <!-- Master Traffic Panel -->
                <div id="traffic-panel" class="panel-section">
                    <h3>Global Master Traffic</h3>
                    <div id="traffic-table-container">Loading secure data...</div>
                </div>

            </div>
        </div>
    </div>

    <!-- Request Modal -->
    <div id="request-modal" class="modal-overlay">
        <div class="modal-box">
            <div class="modal-header">
                Request Numbers
                <span class="modal-close" onclick="closeModal()">×</span>
            </div>
            <div class="modal-body">
                <label>Payment Term</label>
                <input type="text" value="Weekly (Payout - $ 0.01)" disabled style="background:#f1f1f1;" />
                <label>Quantity</label>
                <input type="number" id="request-quantity" value="70" />
                <input type="hidden" id="request-prefix" />
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal()">Close</button>
                <button class="btn-purple" onclick="submitRequest()">Request</button>
            </div>
        </div>
    </div>

    <script>
        // RENDER URL
        const RENDER_BACKEND_URL = "https://website-6z5g.onrender.com"; 

        let loggedInUser = '';
        let isManager = false;
        let userNumbersCache = []; // Caches the user's list for downloading

        setInterval(() => document.getElementById('live-clock').innerText = new Date().toLocaleString(), 1000);

        function login() {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            if(!user) return alert("Enter a username");

            loggedInUser = user;
            if (user === "Kite" && pass === "prince") {
                isManager = true;
                document.getElementById('display-user-role').innerText = "Manager: Kite 👑";
                document.getElementById('manager-add-range').style.display = "block";
            } else {
                isManager = false;
                document.getElementById('display-user-role').innerText = `User: ${user} 👤`;
                document.getElementById('menu-traffic').style.display = "none";
            }

            document.getElementById('login-wrapper').style.display = 'none';
            document.getElementById('dashboard-wrapper').style.display = 'flex';
            switchTab('dashboard');
        }

        function logout() {
            loggedInUser = '';
            document.getElementById('dashboard-wrapper').style.display = 'none';
            document.getElementById('login-wrapper').style.display = 'flex';
        }

        function switchTab(tab) {
            document.querySelectorAll('.panel-section').forEach(p => p.classList.remove('active-panel'));
            document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));
            document.getElementById('menu-' + tab).classList.add('active');
            
            document.getElementById(tab + '-panel').classList.add('active-panel');
            
            if (tab === 'ranges') loadRanges();
            if (tab === 'mynumbers') loadMyNumbers();
            if (tab === 'traffic') fetchMasterTraffic();
            if (tab === 'mysms') fetchMySms();
        }

        // --- RANGES API ---
        async function loadRanges() {
            const res = await fetch(`${RENDER_BACKEND_URL}/api/ranges`);
            const data = await res.json();
            let html = '';
            data.forEach(r => {
                html += `<tr>
                    <td>${r.name}</td><td>${r.prefix}</td><td>${r.testNum}</td>
                    <td>${r.currency}</td>
                    <td style="font-weight:bold; color:#0056b3;">${r.availableCount} left</td>
                    <td><button class="btn-purple" onclick="openModal('${r.prefix}')">REQUEST</button></td>
                </tr>`;
            });
            document.getElementById('ranges-table-body').innerHTML = html;
        }

        // Parse the .txt file and send numbers to backend
        async function addRangeWithFile() {
            const name = document.getElementById('new-range-name').value;
            const prefix = document.getElementById('new-range-prefix').value;
            const fileInput = document.getElementById('new-range-file');
            
            if(!name || !prefix || !fileInput.files[0]) {
                return alert("Please fill the name, prefix, and select a .txt file.");
            }

            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                // Split by new line, remove empty spaces
                const numbersList = e.target.result.split('\\n').map(n => n.trim()).filter(n => n !== '');
                
                const res = await fetch(`${RENDER_BACKEND_URL}/api/ranges`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, prefix, numbers: numbersList })
                });
                
                const responseData = await res.json();
                alert(responseData.message);
                
                // Clear inputs and reload table
                document.getElementById('new-range-name').value = '';
                document.getElementById('new-range-prefix').value = '';
                document.getElementById('new-range-file').value = '';
                loadRanges();
            };
            
            reader.readAsText(file);
        }

        // --- MODAL LOGIC ---
        function openModal(prefix) {
            document.getElementById('request-prefix').value = prefix;
            document.getElementById('request-modal').style.display = 'flex';
        }
        function closeModal() {
            document.getElementById('request-modal').style.display = 'none';
        }

        async function submitRequest() {
            const prefix = document.getElementById('request-prefix').value;
            const quantity = document.getElementById('request-quantity').value;
            
            const res = await fetch(`${RENDER_BACKEND_URL}/api/request-numbers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loggedInUser, prefix, quantity })
            });
            
            const data = await res.json();
            closeModal();
            alert(data.message);
            
            if (data.success) {
                switchTab('mynumbers'); // Go to my numbers to view them
            } else {
                loadRanges(); // Refresh count if it failed
            }
        }

        // --- MY NUMBERS API ---
        async function loadMyNumbers() {
            const res = await fetch(`${RENDER_BACKEND_URL}/api/my-numbers/${loggedInUser}`);
            userNumbersCache = await res.json();
            
            let html = '';
            userNumbersCache.forEach((n, idx) => {
                html += `<tr>
                    <td>${n.rangeName}</td>
                    <td>${n.prefix}</td>
                    <td>${n.numbers.length}</td>
                    <td>${n.date}</td>
                    <td><button class="btn-purple" style="font-size:13px;" onclick="downloadNumList(${idx})">⬇️ Download File</button></td>
                </tr>`;
            });
            document.getElementById('mynumbers-table-body').innerHTML = html || "<tr><td colspan='5'>No numbers requested yet.</td></tr>";
        }

        // Generate a text file for the user to download their numbers
        function downloadNumList(index) {
            const data = userNumbersCache[index];
            const textContent = data.numbers.join('\\n');
            const blob = new Blob([textContent], { type: 'text/plain' });
            
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${data.rangeName}_${data.prefix}_Numbers.txt`;
            a.click();
        }

        // --- TRAFFIC APIs ---
        async function fetchMasterTraffic() {
            try {
                const res = await fetch(`${RENDER_BACKEND_URL}/api/live-traffic`); 
                const data = await res.json();
                buildTrafficTable(data.data, 'traffic-table-container');
            } catch (err) { console.error(err); }
        }

        async function fetchMySms() {
            try {
                const res = await fetch(`${RENDER_BACKEND_URL}/api/my-sms/${loggedInUser}`); 
                const data = await res.json();
                buildTrafficTable(data.data, 'mysms-table-container');
            } catch (err) { console.error(err); }
        }

        function buildTrafficTable(dataArray, containerId) {
            if(!dataArray || dataArray.length === 0) {
                document.getElementById(containerId).innerHTML = "<p>No traffic found yet.</p>";
                return;
            }
            let html = `<table class="data-table"><tr><th>Date</th><th>Number</th><th>Message</th><th>Payout</th></tr>`;
            dataArray.forEach(i => {
                html += `<tr><td>${i.dt}</td><td>${i.num}</td><td>${i.message}</td><td><span class="payout-badge">$${i.payout}</span></td></tr>`;
            });
            document.getElementById(containerId).innerHTML = html + "</table>";
        }

        // Auto-refresh active traffic tab
        setInterval(() => {
            if(document.getElementById('menu-traffic').classList.contains('active')) fetchMasterTraffic();
            if(document.getElementById('menu-mysms').classList.contains('active')) fetchMySms();
        }, 3000);
    </script>
</body>
</html>
