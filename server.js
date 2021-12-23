const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http").createServer(app);
const { initiateLEDS, states, printingState } = require("./service");

const mqtt = require("mqtt");
const host = "192.168.1.11";
const MQTTport = "1883";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
console.log(clientId);
const connectUrl = `mqtt://${host}:${MQTTport}`;
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: "lidor",
  password: "1234",
  reconnectPeriod: 1000,
});
const topics = {
  "octoPrint/event/Disconnected": states.disconnected,
  "octoPrint/event/Connected": states.connected,
  "octoPrint/event/Error": states.disconnected,
  "octoPrint/event/PrintStarted": states.printStarted,
  "octoPrint/event/PrintDone": states.printDone,
  "octoPrint/event/PrintCancelling": states.printCancelling,
  "octoPrint/event/FilamentChange": states.filamentChange,
  "octoPrint/event/PrintResumed": states.printStarted,
  "octoPrint/event/GcodeScriptAfterPrintCancelledFinished":
    states.printCancelled,
};
client.on("connect", () => {
  console.log("Connected");
  client.subscribe(Object.keys(topics), () => {
    console.log(`Subscribed to topics array`);
  });
  client.on("message", (topic, payload) => {
    console.log("MEESAGE!", topic);
    topics[topic]();
  });
});

const corsOptions = {
  origin: [
    "http://127.0.0.1:8080",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ],
  credentials: true,
  allowedHeaders: ["content-type"],
};
app.use(cors(corsOptions));

app.get("/**", (req, res) => {
  res.send("hi");
});

const port = 4444;
http.listen(port, () => console.log(`Listening on port ${port}...`));

//INITATE THE ALGORITHM
initiateLEDS();
// printingState()
