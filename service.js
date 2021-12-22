const { get, post } = require("./httpService");

const OCTOPRINT = "http://192.168.1.11";
const WLED = "http://192.168.1.37";
let printInterval;
const emptySegments = [
  { stop: 0 },
  { stop: 0 },
  { stop: 0 },
  { stop: 0 },
  { stop: 0 },
  { stop: 0 },
  { stop: 0 },
  { stop: 0 },
  { stop: 0 },
  { stop: 0 },
];

const LEDS = 50;
const ROWS = 2;
const LedsPerPercent = LEDS / ROWS / 100;
let isAlreadyOff = false;

const errorState = async () => {
  const segmentsArray = [
    {
      start: 0,
      stop: LEDS,
      col: [
        [255, 0, , 0],
        [250, 250, 250, 0],
        [200, 0, 0, 0],
      ],
      fx: 1,
      sx: 200,
      ix: 200,
    },
    ...emptySegments,
  ];
  const json = {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
  clearInterval(printInterval);
  await post(`${WLED}/json`, json);
  return;
};
const onConnectState = async () => {
  const segmentsArray = [
    {
      start: 0,
      stop: LEDS,
      col: [
        [0, 0, 250, 0],
        [0, 200, 200, 0],
        [0, 0, 0, 0],
      ],
      fx: 12,
      sx: 50,
      ix: 100,
    },
    ...emptySegments,
  ];
  const json = {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
  clearInterval(printInterval);
  await post(`${WLED}/json`, json);
  return;
};
const onCancellingState = async () => {
  const segmentsArray = [
    {
      start: 0,
      stop: LEDS,
      col: [
        [0, 0, 250, 0],
        [250, 250, 250, 0],
        [0, 0, 0, 0],
      ],
      fx: 93,
      sx: 90,
      ix: 110,
    },
    ...emptySegments,
  ];
  const json = {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
  clearInterval(printInterval);
  await post(`${WLED}/json`, json);
  return;
};
const onCompletedPrintState = async () => {
  const segmentsArray = [
    {
      start: 0,
      stop: LEDS,
      col: [
        [0, 255, 0, 0],
        [250, 250, 250, 0],
        [0, 0, 0, 0],
      ],
      fx: 90,
      sx: 55,
      ix: 20,
    },
    ...emptySegments,
  ];
  const json = {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
  clearInterval(printInterval);
  await post(`${WLED}/json`, json);
  return;
};

const filamentChangeState = async () => {
  const segmentsArray = [
    {
      start: 0,
      stop: LEDS,
      col: [
        [0, 150, 250, 0],
        [250, 60, 120, 0],
        [0, 0, 0, 0],
      ],
      fx: 50,
      sx: 70,
      ix: 60,
    },
    ...emptySegments,
  ];
  const json = {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
  clearInterval(printInterval);
  await post(`${WLED}/json`, json);
  setTimeout(onConnectState, 60000);
  return;
};
const printCancelledState = () => {
  setTimeout(onConnectState, 5000);
};
const prepareMatrix = (percaentage) => {
  let segmentsArray = [];
  const lightenLeds = Math.floor(percaentage * LedsPerPercent);
  let mi;
  for (i = 0; i < ROWS; i++) {
    let segLight;
    let segOff;
    if (i % 2 == 0) {
      segLight = {
        start: i * (LEDS / ROWS),
        stop: lightenLeds + 1 + i * (LEDS / ROWS),
        col: [
          [0, 255, 0, 0],
          [60, 200, 60, 0],
          [0, 0, 0, 0],
        ],
        fx: 46,
        sx: 200,
        ix: Math.floor(lightenLeds / 3 + 3),
        bri: 255,
        status: "LIGHTEN of first row",
      };
      segOff = {
        start: lightenLeds + i * (LEDS / ROWS) + 1,
        stop: (LEDS / ROWS) * (i + 1),
        bri: 255,
        col: [
          [255, 0, 0, 0],
          [220, 60, 60, 0],
          [255, 120, 150, 0],
        ],
        fx: 2,
        ix: Math.floor((LEDS - lightenLeds) / 3 + 3),
        sx: 100,
        status: "RED of first row",
      };
      segmentsArray.push(segLight, segOff);
    } else {
      segLight = {
        start: lightenLeds + i * (LEDS / ROWS),
        stop: (LEDS / ROWS) * (i + 1),
        col: [
          [0, 255, 0, 0],
          [60, 200, 60, 0],
          [0, 0, 0, 0],
        ],
        fx: 46,
        sx: 200,
        ix: Math.floor(lightenLeds / 3 + 3),
        bri: 255,
        status: "LIGHTEN of second row",
      };
      segOff = {
        start: i * (LEDS / ROWS),
        stop: lightenLeds + 1 + i * (LEDS / ROWS) - 1,
        bri: 255,
        col: [
          [255, 0, 0, 0],
          [220, 60, 60, 0],
          [255, 120, 150, 0],
        ],
        fx: 2,
        ix: Math.floor((LEDS - lightenLeds) / 3 + 3),
        sx: 100,
        status: "RED of second row",
      };
      segmentsArray.push(segOff, segLight);
    }
  }
  const json = {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
  return json;
};

const updateLeds = async () => {
  console.log("PROCCESSING");
  const jobInfo = await get(`${OCTOPRINT}/api/job`);
  console.log(jobInfo);
  if (jobInfo.progress.printTime === null) {
    if (isAlreadyOff) return;
    isAlreadyOff = true;
    return post(`${WLED}/json`, staticLEDJSON);
  }
  const timeElapsed = Number((jobInfo.progress.printTime / 60).toFixed(2));
  const timeLeft = Number((jobInfo.progress.printTimeLeft / 60).toFixed(2));
  const overallTime = Number((timeElapsed + timeLeft).toFixed(2));
  const percaentage = Math.floor((timeElapsed * 100) / overallTime);
  if (percaentage === 100) return clearInterval(interval);
  console.log(timeElapsed, timeLeft, overallTime, percaentage);
  const json = prepareMatrix(percaentage);
  console.log(json);
  post(`${WLED}/json`, json);
};
const printingState = () => {
  updateLeds();
  printInterval = setInterval(updateLeds, 1000);
};
const states = {
  connected: onConnectState,
  disconnected: errorState,
  printStarted: printingState,
  printCancelling: onCancellingState,
  printCancelled: printCancelledState,
  filamentChange: filamentChangeState,
  printDone: onCompletedPrintState,
};

module.exports = {
  updateLeds,
  initiateLEDS,
  states,
};

function checkIfTempReached(actual, target) {
  console.log(Math.abs(actual - target) < 5);
  if (Math.abs(actual - target) < 5) return true;
  return false;
}

async function initiateLEDS() {
  console.log("HI INITIATE");
  const octoPrintStatus = await get(`${OCTOPRINT}/api/printer`);
  const wledStatus = await get(`${WLED}/json/info`);
  if (octoPrintStatus.err || wledStatus.err) return;
  if (octoPrintStatus.printerNotConnected) return errorState();
  switch (octoPrintStatus.state.text) {
    case "Operational":
      onConnectState();
      break;
    case "Printing":
      const isReached = checkIfTempReached(
        octoPrintStatus.temperature.tool0.actual,
        octoPrintStatus.temperature.tool0.target
      );
      if (isReached) printingState();
      else return; //ADD TEMPERATURE STATE
      break;
    case "Cancelling":
      onCancellingState();
      break;
    default:
      onConnectState();
      break;
  }
}

const prepareSegmentsFor1Row = (percaentage) => {
  let segmentsArray = [];
  const lightenLeds = Math.floor(percaentage * LedsPerPercent);
  console.log(lightenLeds); //SHOULD BE
  let segLight = {
    start: 0,
    stop: lightenLeds + 1,
    col: [
      [0, 255, 0, 0],
      [60, 200, 60, 0],
      [0, 0, 0, 0],
    ],
    fx: 46,
    sx: 200,
    ix: Math.floor(lightenLeds / 3 + 3),
    bri: 255,
  };
  let segOff = {
    start: lightenLeds,
    stop: LEDS,
    bri: 255,
    col: [
      [255, 0, 0, 0],
      [220, 60, 60, 0],
      [255, 120, 150, 0],
    ],
    fx: 2,
    ix: Math.floor((LEDS - lightenLeds) / 3 + 3),
    sx: 100,
  };
  segmentsArray.push(segLight, segOff);

  const json = {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
  return json;
};
