const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Your personal MongoDB Connection Link!
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://xyz987980_db_user:zHxYFDWjfYeh1Vm3@cluster0.itbtnoh.mongodb.net/deepsms?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Database Successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ==========================================
// DATABASE SCHEMAS
// ==========================================
const smsSchema = new mongoose.Schema({
    dt: { type: String, required: true },
    num: { type: String, required: true, index: true },
    message: { type: String, required: true },
    cli: { type: String },
    payout: { type: String, default: "0.012" }
}, { timestamps: true });

smsSchema.index({ dt: 1, num: 1, message: 1 }, { unique: true });

const SmsModel = mongoose.model('Sms', smsSchema);

let ranges = [];
let userNumbers = [];
let accountRequests = [];
let currentApiLink = "http://51.77.216.195/crapi/konek/viewstats?token=SlBXRzRSQmdhd3l4gYCLRouA2";

// ==========================================
// 500,000 SMS BACKGROUND SCRAPER ENGINE
// ==========================================
async function pollMasterApi() {
    if (!currentApiLink) return;
    try {
        const response = await fetch(currentApiLink);
        const data = await response.json();

        if (data && data.data && Array.isArray(data.data)) {
            const bulkOps = data.data.map(msg => ({
                updateOne: {
                    filter: { dt: msg.dt, num: msg.num, message: msg.message },
                    update: { $setOnInsert: { dt: msg.dt, num: msg.num, message: msg.message, cli: msg.cli || '' } },
                    upsert: true
                }
            }));

            if (bulkOps.length > 0) {
                await SmsModel.bulkWrite(bulkOps, { ordered: false });
            }

            const count = await SmsModel.countDocuments();
            if (count > 500000) {
                const oldestToKeep = await SmsModel.find().sort({ _id: -1 }).skip(500000).limit(1);
                if (oldestToKeep.length > 0) {
                    await SmsModel.deleteMany({ _id: { $lt: oldestToKeep[0]._id } });
                }
            }
        }
    } catch (error) {
        if (!error.message.includes('E11000')) {
            console.error("API Scraping Notice:", error.message);
        }
    }
}

setInterval(pollMasterApi, 5000);

// ==========================================
// API ENDPOINTS
// ==========================================
app.get('/', (req, res) => {
    res.send('DEEP SMS PANEL Backend Running with Deletion Features!');
});

app.get('/api/settings/api-link', (req, res) => res.json({ apiLink: currentApiLink }));

app.post('/api/settings/api-link', (req, res) => {
    const { newLink } = req.body;
    if (newLink) {
        currentApiLink = newLink;
        res.json({ success: true, message: "Live API Link updated successfully!" });
    } else {
        res.status(400).json({ success: false, message: "Link cannot be empty." });
    }
});

app.post('/api/request-account', (req, res) => {
    const { username, password, email, whatsapp } = req.body;
    accountRequests.push({ id: Date.now(), username, password, email, whatsapp, date: new Date().toLocaleString() });
    res.json({ success: true, message: "Request submitted successfully." });
});

app.get('/api/account-requests', (req, res) => res.json(accountRequests));
app.delete('/api/account-requests/:id', (req, res) => {
    accountRequests = accountRequests.filter(r => r.id != req.params.id);
    res.json({ success: true });
});

// Ranges
app.post('/api/ranges', (req, res) => {
    const { name, prefix, numbers } = req.body;
    const newRange = { id: Date.now(), name, prefix, testNum: prefix + "0000", currency: "USD", availableNumbers: numbers || [] };
    ranges.push(newRange);
    res.json({ success: true, message: `Range added with ${newRange.availableNumbers.length} numbers!` });
});

app.get('/api/ranges', (req, res) => {
    res.json(ranges.map(r => ({ ...r, availableCount: r.availableNumbers.length })));
});

// NEW: Delete Range (Manager)
app.delete('/api/ranges/:id', (req, res) => {
    ranges = ranges.filter(r => r.id != req.params.id);
    res.json({ success: true });
});

// Numbers
app.post('/api/request-numbers', (req, res) => {
    const { username, prefix, quantity } = req.body;
    const reqQty = parseInt(quantity);

    if (isNaN(reqQty) || reqQty < 1 || reqQty > 200) {
        return res.status(400).json({ success: false, message: "Enter a quantity between 1 and 200." });
    }

    const rangeIndex = ranges.findIndex(r => r.prefix === prefix);
    if (rangeIndex === -1) return res.status(404).json({ success: false, message: "Range not found." });

    const range = ranges[rangeIndex];
    if (range.availableNumbers.length < reqQty) {
        return res.status(400).json({ success: false, message: `Only ${range.availableNumbers.length} numbers left.` });
    }

    const assignedNumbers = range.availableNumbers.splice(0, reqQty);
    userNumbers.push({ 
        id: Date.now(), // Added unique ID for deletion
        username, rangeName: range.name, prefix: range.prefix, numbers: assignedNumbers, date: new Date().toLocaleString() 
    });

    if (range.availableNumbers.length === 0) ranges.splice(rangeIndex, 1);
    res.json({ success: true, message: `Successfully claimed ${reqQty} numbers!` });
});

app.get('/api/my-numbers/:username', (req, res) => {
    res.json(userNumbers.filter(n => n.username === req.params.username));
});

// NEW: Get all numbers (For Manager)
app.get('/api/all-numbers', (req, res) => {
    res.json(userNumbers);
});

// NEW: Delete specific claimed number block
app.delete('/api/user-numbers/:id', (req, res) => {
    userNumbers = userNumbers.filter(n => n.id != req.params.id);
    res.json({ success: true });
});

// Traffic
app.get('/api/live-traffic', async (req, res) => {
    try {
        const data = await SmsModel.find().sort({ _id: -1 }).limit(500);
        res.json({ data });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.get('/api/my-sms/:username', async (req, res) => {
    try {
        let mySpecificNumbers = [];
        userNumbers.filter(n => n.username === req.params.username).forEach(reqList => {
            mySpecificNumbers.push(...reqList.numbers);
        });

        if (mySpecificNumbers.length === 0) {
            return res.json({ data: [] });
        }

        const data = await SmsModel.find({ num: { $in: mySpecificNumbers } }).sort({ _id: -1 }).limit(1000);
        res.json({ data });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    pollMasterApi();
});
