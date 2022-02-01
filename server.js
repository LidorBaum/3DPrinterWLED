const environment = process.env.NODE_ENV || "pi";
console.log(environment, "-environment");
const { octoprintLoading, initiateLEDS, states } = require("./service");
const { host, MQTTport } = require("./config");
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
client.on("connect", () => {
  console.log("Connected to MQTT");
  if (environment === "pi") {
    octoprintLoading();
    setTimeout(initiateLEDS, 3000);
  }
  client.subscribe(Object.keys(topics), () => {
    console.log(`Subscribed to topics array`);
  });
  client.on("message", (topic, payload) => {
    console.log("MEESAGE!", topic);
    topics[topic]();
  });
});

if (environment !== "pi") initiateLEDS();
