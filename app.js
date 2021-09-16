const fs = require('fs');
const { MongoClient } = require('mongodb');
const { google } = require('googleapis');
const express = require('express');

const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const app = express();
const port = process.env.PORT || 3000;

app.listen(port);
console.log(`App listening on port ${port}`);

app.use(express.urlencoded({extended: true})); 
app.use(express.json());

app.get('/oauth2callback', async (req, res) => {
    const status = await authenticate(req.query.code, oAuth2Client);
    res.send(status);
});

app.post('/create_event', async (req, res) => {
    if (req.body.api_key != process.env.API_KEY) return res.send('Access denied.');
    if (/[^a-z0-9]/gi.test(req.body.event_name)) return res.send('Invalid event name.');
    if (verifyDate(req.body.start_date)) return res.send('Invalid start date.');
    if (verifyDate(req.body.end_date)) return res.send('Invalid end date.');

    const status = await createEvent(req.body.event_name, req.body.start_date, req.body.end_date)
    res.send(status);
});

app.post('/rsvp_event', async (req, res) => {
    if (req.body.api_key != process.env.API_KEY) return res.send('Access denied.');
    const status = await rsvpEvent(req.body.event_id, req.body.attendee_name);
    res.send(status);
});

app.get('/list_rsvp', async (req, res) => {
    if (req.body.api_key != process.env.API_KEY) return res.send('Access denied.');
    const status = await listRsvps(req.body.event_id);
    res.send(status);
});

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
const dbClient = new MongoClient(process.env.URI);
var calendar;

retrieveToken(oAuth2Client);

function retrieveToken (authClient) {
    fs.readFile(TOKEN_PATH, (err, data) => {
        if (err) return getNewToken(authClient);
        authClient.setCredentials(JSON.parse(data));
        calendar = google.calendar({ version: 'v3', auth: authClient });
    });
}

function getNewToken (authClient) {
    const authUrl = authClient.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log(`Auth url: ${authUrl}`);
}

async function authenticate (code, authClient) {
    if (!code) return console.log('Error: access denied');
    authClient.getToken(code, (err, token) => {
        if (err) return console.error('Error getting token with code: ', err);
        authClient.setCredentials(token);
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error('Error writing token to file: ', err);
            console.log('Token stored to ', TOKEN_PATH);
        });
        calendar = google.calendar({ version: 'v3', auth: authClient });
        return 200;
    });
}

async function createEvent (event_name, start_date, end_date) {
    try {
        await dbClient.connect();
        const db = dbClient.db('calendar');
        const res = await calendar.events.insert({
            calendarId: process.env.CALENDAR_ID || 'primary',
            resource: {
                summary: event_name,
                start: {
                    dateTime: convertDate(start_date)
                },
                end: {
                    dateTime: convertDate(end_date)
                }
            }
        });
        const collection = await db.createCollection(res.data.id);
        return `Event id ${collection.collectionName} created successfully!`;
    } catch (error) {
        console.error(error);
        return `ERROR: ${error}`;
    } finally {
        await dbClient.close();
    }
}

async function rsvpEvent (event_id, attendee_name) {
    try {
        await dbClient.connect();
        const db = dbClient.db('calendar');
        const exists = await db.listCollections({ name: event_id }).hasNext();
        if (!exists) return `ERROR: Event id ${event_id} not found!`;
        const collection = db.collection(event_id);
        const document = await collection.insertOne({ 'attendee_name': attendee_name });
        return `Added ${attendee_name} to event id ${event_id} RSVPs (dbID ${document.insertedId})`;
    } catch (error) {
        console.error(error);
        return `ERROR: ${error}`;
    } finally {
        dbClient.close();
    }
}

async function listRsvps (event_id) {
    try {
        await dbClient.connect();
        const db = dbClient.db('calendar');
        const exists = await db.listCollections({ name: event_id }).hasNext();
        if (!exists) return `ERROR: Event id ${event_id} not found!`;
        const collection = db.collection(event_id);
        var results = await collection.find().toArray();
        results.forEach((result, index) => {
            results[index] = { attendee_name: result.attendee_name };
        });
        return results;
    } catch (error) {
        console.error(error);
        return `ERROR: ${error}`;
    } finally {
        dbClient.close();
    }
}

function convertDate (date) {
    return new Date(date.trim()).toISOString();
}

function verifyDate (date) {
    if (!date) return true;
    const components = date.trim().split(' ');
    if (components.length != 3) return true;
    if (!(/^\d{4}-\d{2}-\d{2}$/.test(components[0]))) return true;
    var ymd = new Date(components[0]);
    if (!ymd.getTime() && ymd.getTime() !== 0) return true;
    if (!(/^(0?[1-9]|1[0-2]):[0-5][0-9]$/.test(components[1]))) return true;
    if (components[2] == 'AM' || components[2] == 'PM') return false;
}
