const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Increased limit so the manager can upload large .txt lists without crashing
app.use(express.json({ limit: '10mb' })); 

// ==========================================
// IN-MEMORY STORAGE (Temporary Database)
// ==========================================
let ranges = []; 
let userNumbers = []; 
let accountRequests = []; // Stores the new account requests

// Health check to ensure server is awake
app.get('/', (req, res) => {
    res.send('DEEP SMS PANEL Backend is Running Live!');
});

// ==========================================
// ACCOUNT REQUESTS API
// ==========================================
app.post('/api/request-account', (req, res) => {
    const { username, password, email, whatsapp } = req.body;
    
    accountRequests.push({
        id: Date.now(),
        username,
        password,
        email,
        whatsapp,
        date: new Date().toLocaleString()
    });
    
    // Sends back the exact success message requested
    res.json({ 
        success: true, 
        message: "Your request of create account is sent to the manager, If you have some problem then contact on kiteprincepanel@gmail.com" 
    });
});

app.get('/api/account-requests', (req, res) => {
    res.json(accountRequests);
});

app.delete('/api/account-requests/:id', (req, res) => {
    // Removes the request when the manager clicks "Clear"
    accountRequests = accountRequests.filter(r => r.id != req.params.id);
    res.json({ success: true });
});

// ==========================================
// RANGES & NUMBERS API
// ==========================================
app.post('/api/ranges', (req, res) => {
    const { name, prefix, numbers } = req.body;
    const newRange = { 
        id: Date.now(), 
        name, 
        prefix, 
        testNum: prefix + "0000", 
        currency: "USD", 
        memo: "",
        availableNumbers: numbers || [] 
    };
    ranges.push(newRange);
    res.json({ success: true, message: `Range added with ${newRange.availableNumbers.length} numbers!` });
});

app.get('/api/ranges', (req, res) => {
    // Only send the count to the frontend so it doesn't overload the user's internet
    const safeRanges = ranges.map(r => ({
        ...r, availableCount: r.availableNumbers.length
    }));
    res.json(safeRanges);
});

app.post('/api/request-numbers', (req, res) => {
    const { username, prefix, quantity } = req.body;
    const reqQty = parseInt(quantity);
    
    const range = ranges.find(r => r.prefix === prefix);
    if (!range) return res.status(404).json({ success: false, message: "Range not found" });
    if (range.availableNumbers.length < reqQty) {
        return res.status(400).json({ success: false, message: `Only ${range.availableNumbers.length} numbers available.` });
    }

    // Pull exactly the requested amount out of the file
    const assignedNumbers = range.availableNumbers.splice(0, reqQty);
    
    userNumbers.push({ 
        username, 
        rangeName: range.name, 
        prefix: range.prefix,
        numbers: assignedNumbers, 
        date: new Date().toLocaleString() 
    });

    res.json({ success: true, message: `Successfully claimed ${reqQty} numbers!` });
});

app.get('/api/my-numbers/:username', (req, res) => {
    const myNums = userNumbers.filter(n => n.username === req.params.username);
    res.json(myNums);
});

// ==========================================
// LIVE TRAFFIC API PROXY
// ==========================================
const MASTER_API_LINK = "http://51.77.216.195/crapi/konek/viewstats?token=SlBXRzRSQmdhd3l4gYCLRouA2";

// Manager View: Sees everything
app.get('/api/live-traffic', async (req, res) => {
    try {
        const response = await fetch(MASTER_API_LINK);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// User View: Only sees messages to their assigned numbers, payout forced to $0.01
app.get('/api/my-sms/:username', async (req, res) => {
    try {
        const response = await fetch(MASTER_API_LINK);
        const data = await response.json();
        
        // Find all the specific numbers this user claimed
        let mySpecificNumbers = new Set();
        userNumbers.filter(n => n.username === req.params.username).forEach(reqList => {
            reqList.numbers.forEach(num => mySpecificNumbers.add(num));
        });
        
        // Filter out everything else
        const filteredData = data.data.filter(item => mySpecificNumbers.has(item.num));
        const finalData = filteredData.map(item => ({ ...item, payout: "0.01" }));

        res.json({ data: finalData });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
