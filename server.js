require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Render HTML page
app.get('/', (req, res) => {
    res.render('index');
});

// Endpoint to make call
app.post('/make-call', async (req, res) => {
    const { phone } = req.body;

    if (!phone) return res.send('Please provide a phone number');

    try {
     
        res.send(`Call initiated! Call SID: ${call.sid}`);   const call = await client.calls.create({
            url: process.env.TWILIO_CALL_URL, // replace with your deployed server URL
            to: phone,
            from: process.env.TWILIO_NUMBER
        });
    } catch (err) {
        res.send(`Error: ${err.message}`);
    }
});

// Twilio webhook for voice instructions
app.post('/voice', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Hello! This is a test call from your Twilio free trial account.');
    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));