# calendar-api
API with an RSVP system that interacts with the Google Calendar. 
Endpoints include `create_event`, `rsvp_event`, and `list_rsvp`. 

## Local Setup
### Pre-requisites
* Node.js with npm
* MongoDB Atlas Account
* Google Account

### Repository
1. Download the repository
2. Create a `.env` file in the repository with the following:
```
API_KEY=yourMadeUpKey
CALENDAR_ID=
URI=
CLIENT_ID=
CLIENT_SECRET=
REDIRECT_URI=
```

### Database
1. Log into your Atlas account
2. Create a new cluster
    1. Choose allowed IPs
    2. Create a database account
    3. Choose `Connect your application`
    4. Copy the provided `uri` into the `.env` URI field

### Google API
1. Log into your google account
2. Go to the [Google Developer Console](https://console.cloud.google.com/)
3. Create a new project
4. Enable Google Calendar API through the [API library](https://console.cloud.google.com/apis/library)
5. Navigate to `credentials`
    1. Click create credentials
    2. Click OAuth Client ID
    3. Select Web application
    4. Add a URI ending with `/oauth2callback` (eg. `http://localhost:3000/oauth2callback`)
    5. Download the auth client file
6. Copy the approperiate fields from the auth file into the approperiate `.env` fields
7. Navigate to `OAuth consent screen`
    1. Add a test user
    2. Write your google account email

### Calendar
1. Go to the [Google Calendar](https://calendar.google.com/calendar)
2. (Optional) Create a new calendar
3. Navigate to the calendar's settings
4. Copy the Calendar ID into the `.env` CALENDAR_ID field

### Initial Start
1. Run the app with `npm start`
2. Click the link generated in the console
    1. Authorize the application

*Subsequent `npm start` should now start the application without asking for authorization*

## Heroku
This API is hosted on Heroku:
* hostname: `rsvp-calendar-api.herokuapp.com`
* api_key: `apikey123`

You can check the calendar [here](https://calendar.google.com/calendar/u/3?cid=NXR1cGFmazZlZzhybDFnOWd2cG11bzRjb2dAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ).

*Apps on Heroku tend to sleep after being idle for some time which means it may take a while to initially process an API request.*

## API Usage
```
POST /create_event
Eg. http://localhost:3000/create_event

{
    "api_key": "superSecret",
    "event_name": "Cool ACM event",
    "start_date": "2021-09-16 3:59 PM",
    "end_date": "2021-09-16 4:59 PM"
}

=>

event_id

```
```
POST /rsvp_event
Eg. http://localhost:3000/rsvp_event

{
    "api_key": "superSecret",
    "event_id": "sOmeThinGlIkEtHat25123",
    "attendee_name": "John Doe"
}

=>

db_insertion_id

```
```
GET /list_rsvp
Eg. http://localhost:3000/read_messages

{
    "api_key": "superSecret",
    "event_id": "sOmeThinGlIkEtHat25123"
}

=>

[{
    "attendee_name": "John Doe"
}]

```
