# calendar-api
API with an RSVP system that interacts with the Google Calendar. 
Endpoints include `create_event`, `rsvp_event`, and `list_rsvp`. 

## Local Setup
### Pre-requisites
* Node.js with npm
* MongoDB Atlas Account
* Google Account

## Heroku
This API is hosted on Heroku:
* hostname: `rsvp-calendar-api.herokuapp.com`
* api_key: `apikey123`

You can check the calendar [here](https://calendar.google.com/calendar/u/3?cid=NXR1cGFmazZlZzhybDFnOWd2cG11bzRjb2dAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ).

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
