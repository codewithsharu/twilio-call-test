require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const { AccessToken, VoiceGrant } = twilio.jwt.AccessToken;
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

// Endpoint to generate Twilio Access Token
app.get('/token', (req, res) => {
    // Get the identity from the query string or generate a random one
    const identity = req.query.identity || 'browser_client';

    // Create an Access Token
    const accessToken = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        {
            identity: identity
        }
    );

    // Create a Voice Grant and add to the token
    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
        incomingAllow: true,
    });
    accessToken.addGrant(voiceGrant);

    // Serialize the token to a JWT string
    res.send({
        identity: identity,
        token: accessToken.toJwt(),
    });
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