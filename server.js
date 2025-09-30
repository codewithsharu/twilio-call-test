require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Render HTML page
app.get('/', (req, res) => {
    res.render('index', { message: null }); // send empty message by default
});

// Endpoint to make call
app.post('/make-call', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.render('index', { message: '❌ Please provide a phone number' });
    }

    try {
        let callResult = await client.calls.create({
            url: process.env.TWILIO_CALL_URL,  // must be your /voice endpoint
            to: phone,
            from: process.env.TWILIO_NUMBER
        });
        return res.render('index', { message: `✅ Call initiated! Call SID: ${callResult.sid}` });
    } catch (err) {
        return res.render('index', { message: `❌ Error: ${err.message}` });
    }
});

// Twilio webhook for voice instructions
app.post('/voice', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    // twiml.say('Hello! This is a test call from your Twilio free trial account.');
    twiml.dial({ callerId: process.env.TWILIO_NUMBER }, req.body.From);
    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));