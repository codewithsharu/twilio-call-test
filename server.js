
require('dotenv').config();

const express = require('express');
const twilio = require('twilio');
const app = express();
const port = 3000;

// Load Twilio credentials and config from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_NUMBER;
const twilioCallUrl = process.env.TWILIO_CALL_URL;
// Optional: You can add TWILIO_AGENT_NUMBER to .env if you want to use it
const twilioAgentNumber = process.env.TWILIO_AGENT_NUMBER || '+917816072525'; // fallback if not set

const client = new twilio.Twilio(accountSid, authToken);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { phoneNumber: twilioPhoneNumber });
});

app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // When a call comes in, say something and then gather input
  twiml.say('Hello from your Node.js Twilio application! Please say something after the beep.');
  twiml.record({
    timeout: 10,
    action: '/handle-recording',
    method: 'POST'
  });

  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/handle-recording', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  if (req.body.RecordingUrl) {
    twiml.say('Thanks for your message. You said:');
    twiml.play(req.body.RecordingUrl);
  } else {
    twiml.say('No recording received.');
  }

  twiml.say('Goodbye!');
  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/make-call', (req, res) => {
  const to = req.body.to;
  const connectTo = req.body.connectTo;

  if (!connectTo) {
    return res.status(400).send('Missing connectTo number.');
  }

  client.calls.create({
    url: `${twilioCallUrl}twiml?connectTo=${encodeURIComponent(connectTo)}`, // Pass connectTo as a query parameter
    to: to,
    from: twilioPhoneNumber
  })
  .then((call) => {
    console.log(call.sid);
    res.send(`Calling ${to}... Connecting to ${connectTo}...`);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error making call');
  });
});

app.post('/twiml', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const connectToNumber = req.query.connectTo; // Get connectTo from query parameter

  twiml.say('You are connected to the Twilio two-way call application. Please wait while we connect you.');
  
  if (connectToNumber) {
    twiml.dial(connectToNumber);
  } else {
    twiml.say('No number to connect to, hanging up.');
    twiml.hangup();
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
