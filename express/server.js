'use strict';
const express = require('express');
const cors = require("cors");
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const webpush = require("web-push");
// const fs = require("fs");

// console.log("Going to write into existing file");
// // Open a new file with name input.txt and write Simply Easy Learning! to it.
// fs.writeFile('input.txt', 'Simply Easy Learning!', function(err) {
//    if (err) {
//       return console.error(err);
//    }
//    console.log("Data written successfully!");
//    console.log("Let's read newly written data");
//    // Read the newly written file and print all of its content on the console
//    fs.readFile('input.txt', function (err, data) {
//       if (err) {
//          return console.error(err);
//       }
//       console.log("Asynchronous read: " + data.toString());
//    });
// });

app.use(cors()); // allow access from any origin ! important must be declared here on top !

const router = express.Router();
router.use(cors());

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

//const dummyDb = { subscription: null }; //dummy in memory store

const dummyDb = { subscription: {"endpoint":"https://fcm.googleapis.com/fcm/send/fBmsPugxrCA:APA91bHQbRJqBprTwkMzYkc6Nck3pEKnFiQUCLtfKqS6lC2oRg0Y48ra0vVbqEkK1R3sVW7Besk1Antwcj286OjeinPs1rh7_xFociYGtY_T6FUeO9okWeDCuo5vOMbXYaKoRyNc1_47","expirationTime":null,"keys":{"p256dh":"BFk51WEEehspDGHByutFGr1hlzLn2Vyl3Pdwo0C4Ry7rFkYuB_ubB_JdwsxJGG-fDOrAChlwlHSnBihA99MBC-k","auth":"NWkXyy5ApSUPMBvV3wx2kQ"}}}

const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription;
};

// The new /save-subscription endpoint
router.post("/save-subscription", async (req, res) => {
  const subscription = req.body;
  //await saveToDatabase(subscription); //Method to save the subscription to Database
  res.json({ message: "success" });
});

const vapidKeys = {
  publicKey: "BO2VWBsugZsT1Xx4KbigaTSkXgr_eBJYa7_Xk3NJ7ELOcjD2wsGIxF1rYpUNybF_aiH9SAysQw4iFsrbC8Tec1k",
  privateKey: "DJC5V0Y_3fsVvGTxwKNHNenfFVfsk5xQB7jCqRBJe2Q",
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
