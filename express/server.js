'use strict';
const express = require('express');
const cors = require("cors");
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const webpush = require("web-push");

const router = express.Router();

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

const dummyDb = { subscription: null }; //dummy in memory store

const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription;
};

// The new /save-subscription endpoint
router.post("/save-subscription", async (req, res) => {
  const subscription = req.body;
  await saveToDatabase(subscription); //Method to save the subscription to Database
  res.json({ message: "success" });
});

const vapidKeys = {
  publicKey: "BJYgfnAO5L9oTBFyTcHYdTgyf1gcGb08FBNRvzVStaA0r0_nHUQMTz9-wNhwD2ss3cluAAGfqo5ath4MwKwMKhk",
  privateKey: "O_VJ8JLL7gpaz81_kUvPiZH7bPV0rzF943sgpLIjncE",
}

//setting our previously generated VAPID keys
webpush.setVapidDetails(
  "mailto:myuserid@email.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

//function to send the notification to the subscribed device
const sendNotification = async (subscription, dataToSend) => {
  webpush.sendNotification(subscription, dataToSend);
};

//route to test send notification
router.get("/send-notification", async (req, res) => {
  const subscription = dummyDb.subscription //get subscription from your databse here.
  const message = "Hello World"
  await sendNotification(subscription, message);
  res.json({ message: "message sent" });
});

module.exports = app;
module.exports.handler = serverless(app);
