// const express = require("express");
// const cors = require("cors");
// const app = express();
// const http = require("http").createServer(app);
const environment = process.env.NODE_ENV || "pi";
console.log(environment);
const { octoprintLoading, initiateLEDS, states } = require("./service");
const { host, MQTTport } = require("./config");
let isInitiated = false;
const mqtt = require("mqtt");
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `mqtt://${host}:${MQTTport}`;
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});
const topics = {
  "octoPrint/event/Startup": initiateLEDS,
  "octoPrint/event/Disconnected": states.disconnected,
  "octoPrint/event/Connected": states.connected,
  "octoPrint/event/Error": states.disconnected,
  "octoPrint/event/PrintStarted": states.printStarted,
  "octoPrint/event/PrintDone": states.printDone,
  "octoPrint/event/PrintCancelling": states.printCancelling,
  "octoPrint/event/FilamentChange": states.filamentChange,
  "octoPrint/event/PrintResumed": states.printStarted,
  "octoPrint/event/Startup": states.connected,
  "octoPrint/event/GcodeScriptAfterPrintCancelledFinished":
    states.printCancelled,
};
const { get, post } = require("./httpService");
client.on("connect", () => {
  console.log("Connected to MQTT");
  console.log(environment , 'env');

  //if it is the first subscribe && no pi, so no wait
  if (environment === "pi"){
    console.log('pi environment');
    octoprintLoading()
    setTimeout(initiateLEDS, 25000);
  }
  client.subscribe(Object.keys(topics), () => {
    console.log(`Subscribed to topics array`);
  });
  client.on("message", (topic, payload) => {
    console.log("MEESAGE!", topic);
    topics[topic]();
  });
});

// const corsOptions = {
//   origin: [
//     "http://127.0.0.1:8080",
//     "http://localhost:8080",
//     "http://127.0.0.1:3000",
//     "http://localhost:3000",
//   ],
//   credentials: true,
//   allowedHeaders: ["content-type"],
// };
// app.use(cors(corsOptions));

// app.get("/**", (req, res) => {
//   res.send("hi");
// });

// const port = 4444;
// http.listen(port, () => console.log(`Listening on port ${port}...`));

//INITATE THE ALGORITHM
if (environment !== "pi") initiateLEDS();
// printingState()
