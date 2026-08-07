const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); 

let ranges = []; 
let userNumbers = []; 
let accountRequests = []; 
let currentApiLink = "http://51.77.216.195/crapi/konek/viewstats?token=SlBXRzRSQmdhd3l4gYCLRouA2"; // Default API

app.get('/', (req, res) => {
    res.send('DEEP SMS PANEL Backend is Running Live!');
});

// ==========================================
// MANAGER API SETTINGS
// ==========================================
app.get('/api/settings/api-link', (req, res) => {
    res.json({ apiLink: currentApiLink });
});

app.post('/api/settings/api-link', (req, res) => {
    const { newLink } = req.body;
    if (newLink) {
        currentApiLink = newLink;
        res.json({ success: true, message: "Live API Link updated successfully! The panel is now pulling from the new source." });
    } else {
        res.status(400).json({ success: false, message: "Link cannot be empty." });
    }
});

// ==========================================
// ACCOUNT REQUESTS API
// ==========================================
app.post('/api/request-account', (req, res) => {
    const { username, password, email, whatsapp } = req.body;
    accountRequests.push({
        id: Date.now(), username, password, email, whatsapp,
        date: new Date().toLocaleString()
    });
    res.json({ success: true, message: "Your request of create account is sent to the manager, If you have some problem then contact on kiteprincepanel@gmail.com" });
});

app.get('/api/account-requests', (req, res) => res.json(accountRequests));
app.delete('/api/account-requests/:id', (req, res) => {
    accountRequests = accountRequests.filter(r => r.id != req.params.id);
    res.json({ success: true });
});

// ==========================================
// RANGES & NUMBERS API
// ==========================================
app.post('/api/ranges', (req, res) => {
    const { name, prefix, numbers } = req.body;
    const newRange = { 
        id: Date.now(), name, prefix, testNum: prefix + "0000", currency: "USD", memo: "", availableNumbers: numbers || [] 
    };
    ranges.push(newRange);
    res.json({ success: true, message: `Range added with ${newRange.availableNumbers.length} numbers!` });
});

app.get('/api/ranges', (req, res) => {
    res.json(ranges.map(r => ({ ...r, availableCount: r.availableNumbers.length })));
});

app.post('/api/request-numbers', (req, res) => {
    const { username, prefix, quantity } = req.body;
    const reqQty = parseInt(quantity);
    
    if (isNaN(reqQty) || reqQty < 1 || reqQty > 200) {
        return res.status(400).json({ success: false, message: "You can only request between 1 and 200 numbers at a time." });
    }

    const rangeIndex = ranges.findIndex(r => r.prefix === prefix);
    if (rangeIndex === -1) return res.status(404).json({ success: false, message: "Range not found or fully claimed." });

    const range = ranges[rangeIndex];
    if (range.availableNumbers.length < reqQty) {
        return res.status(400).json({ success: false, message: `Only ${range.availableNumbers.length} numbers available.` });
    }

    const assignedNumbers = range.availableNumbers.splice(0, reqQty);
    userNumbers.push({ 
        username, rangeName: range.name, prefix: range.prefix, numbers: assignedNumbers, date: new Date().toLocaleString() 
    });

    if (range.availableNumbers.length === 0) ranges.splice(rangeIndex, 1);
    res.json({ success: true, message: `Successfully claimed ${reqQty} numbers!` });
});

app.get('/api/my-numbers/:username', (req, res) => {
    res.json(userNumbers.filter(n => n.username === req.params.username));
});

// ==========================================
// LIVE TRAFFIC API PROXY
// ==========================================
app.get('/api/live-traffic', async (req, res) => {
    try {
        const response = await fetch(currentApiLink); // Now pulls from the dynamic link!
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.get('/api/my-sms/:username', async (req, res) => {
    try {
        const response = await fetch(currentApiLink);
        const data = await response.json();
        
        let mySpecificNumbers = new Set();
        userNumbers.filter(n => n.username === req.params.username).forEach(reqList => {
            reqList.numbers.forEach(num => mySpecificNumbers.add(num));
        });
        
        const filteredData = data.data.filter(item => mySpecificNumbers.has(item.num));
        const finalData = filteredData.map(item => ({ ...item, payout: "0.012" }));

        res.json({ data: finalData });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
