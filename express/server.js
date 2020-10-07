'use strict';
const express = require('express');
const cors = require("cors");
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const webpush = require("web-push");

app.use(cors()); // allow access from any origin ! important must be declared here on top !

const router = express.Router();

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

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
  publicKey: "BCceksRUt3O_5PecSr4FR33qiqWYRULlR-qkCdIE5I0yKQ_WMyMwUF7u-QHOAiKpyAT9SkAzoyrqLm1xub_WmiA",
  privateKey: "FRQaRGkuVguG8i3PlxAoSjazHBH3MRj-ywuTkXsN9HY",
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

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
