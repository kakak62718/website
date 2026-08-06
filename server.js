const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for large number lists

// ==========================================
// IN-MEMORY STORAGE
// ==========================================
let ranges = []; // Holds the ranges and the remaining available numbers
let userNumbers = []; // Holds the specific numbers assigned to each user

app.get('/', (req, res) => {
    res.send('DEEP SMS PANEL Backend is Running Live!');
});

// ==========================================
// RANGES & NUMBERS API
// ==========================================
// Manager uploads a new range with a list of numbers
app.post('/api/ranges', (req, res) => {
    const { name, prefix, numbers } = req.body;
    
    const newRange = { 
        id: Date.now(), 
        name, 
        prefix, 
        testNum: prefix + "0000", 
        currency: "USD", 
        memo: "",
        availableNumbers: numbers || [] // Array of specific phone numbers
    };
    
    ranges.push(newRange);
    res.json({ success: true, message: `Range added with ${newRange.availableNumbers.length} numbers!` });
});

// Get all ranges (hides the actual number list to save frontend bandwidth)
app.get('/api/ranges', (req, res) => {
    const safeRanges = ranges.map(r => ({
        ...r,
        availableCount: r.availableNumbers.length
    }));
    res.json(safeRanges);
});

// User requests numbers
app.post('/api/request-numbers', (req, res) => {
    const { username, prefix, quantity } = req.body;
    const reqQty = parseInt(quantity);
    
    // Find the range
    const range = ranges.find(r => r.prefix === prefix);
    if (!range) return res.status(404).json({ success: false, message: "Range not found" });
    
            // Check if user is remembered on page load
        window.onload = function() {
            const savedUser = localStorage.getItem('deepSmsUser');
            const savedPass = localStorage.getItem('deepSmsPass');
            if (savedUser && savedPass) {
                document.getElementById('username').value = savedUser;
                document.getElementById('password').value = savedPass;
                document.getElementById('remember-me').checked = true;
            }
        };

        function login() {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            const remember = document.getElementById('remember-me').checked;
            
            if(!user) return alert("Enter a username");

            // Handle Remember Me
            if (remember) {
                localStorage.setItem('deepSmsUser', user);
                localStorage.setItem('deepSmsPass', pass);
            } else {
                localStorage.removeItem('deepSmsUser');
                localStorage.removeItem('deepSmsPass');
            }

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


    // Extract exactly the amount of numbers requested and REMOVE them from the main list
    const assignedNumbers = range.availableNumbers.splice(0, reqQty);

    // Save them to the user's account
    userNumbers.push({ 
        username, 
        rangeName: range.name,
        prefix: range.prefix,
        numbers: assignedNumbers, // The exact list of numbers they got
        date: new Date().toLocaleString() 
    });

    res.json({ success: true, message: `Successfully claimed ${reqQty} numbers!` });
});

// Get a specific user's requested numbers
app.get('/api/my-numbers/:username', (req, res) => {
    const myNums = userNumbers.filter(n => n.username === req.params.username);
    res.json(myNums);
});

// ==========================================
// LIVE TRAFFIC API PROXY
// ==========================================
const MASTER_API_LINK = "http://51.77.216.195/crapi/konek/viewstats?token=SlBXRzRSQmdhd3l4gYCLRouA2";

// Global Live Traffic (Manager View)
app.get('/api/live-traffic', async (req, res) => {
    try {
        const response = await fetch(MASTER_API_LINK);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Filtered "My SMS" Traffic (User View - 0.01$ payout)
app.get('/api/my-sms/:username', async (req, res) => {
    try {
        const response = await fetch(MASTER_API_LINK);
        const data = await response.json();
        
        // Gather ALL specific numbers this user owns across all their requests
        let mySpecificNumbers = new Set();
        userNumbers.filter(n => n.username === req.params.username).forEach(reqList => {
            reqList.numbers.forEach(num => mySpecificNumbers.add(num));
        });
        
        // Filter traffic to ONLY include messages sent to the user's specific numbers
        const filteredData = data.data.filter(item => mySpecificNumbers.has(item.num));

        // Override the payout to $0.01 for the user view
        const finalData = filteredData.map(item => ({
            ...item,
            payout: "0.01" 
        }));

        res.json({ data: finalData });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
