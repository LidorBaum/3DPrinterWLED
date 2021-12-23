const { get, post } = require("./httpService");
const { LEDS, ROWS, OCTOPRINT, WLED } = require("./config");
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
const LedsPerPercent = LEDS / ROWS / 100;
let isAlreadyOff = false;
let shouldCheckTemps = true;

const getSegmentColor = (color, lightenLeds) => {
  const colors = {
    colorRedBreath: {
      col: [
        [255, 0, 0, 0],
        [220, 60, 60, 0],
        [255, 120, 150, 0],
      ],
      fx: 2,
      ix: Math.floor((LEDS - lightenLeds) / 3 + 3),
      sx: 100,
    },
    colorGreenGradient: {
      col: [
        [0, 255, 0, 0],
        [60, 200, 60, 0],
        [0, 0, 0, 0],
      ],
      fx: 46,
      sx: 240,
      ix: Math.floor(lightenLeds / 3 + 2),
    },
    colorBlueBreath: {
      col: [
        [0, 0, 250, 0],
        [100, 100, 250, 0],
        [0, 0, 0, 0],
      ],
      fx: 2,
      ix: Math.floor((LEDS - lightenLeds) / 3 + 3),
      sx: 100,
    },
    colorRedGradient: {
      col: [
        [255, 120, 0, 0],
        [220, 60, 60, 0],
        [255, 120, 150, 0],
      ],
      fx: 46,
      sx: 200,
      ix: Math.floor(lightenLeds / 3 + 3),
    },
  };
  return colors[color];
};

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
  shouldCheckTemps = true;
  console.log("posting error state");
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
  shouldCheckTemps = true;
  console.log("posting connected state");
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
  shouldCheckTemps = true;
  clearInterval(printInterval);
  console.log("posting cancelling state");
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
  shouldCheckTemps = true;
  clearInterval(printInterval);
  console.log("posting completedPrint state");
  await post(`${WLED}/json`, json);
  setTimeout(onConnectState, 6000);
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
      sx: 100,
      ix: 150,
    },
    ...emptySegments,
  ];
  const json = {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
  shouldCheckTemps = true;
  clearInterval(printInterval);
  console.log("posting M600 state");
  await post(`${WLED}/json`, json);
  setTimeout(onConnectState, 60000);
  return;
};

const printCancelledState = () => {
  setTimeout(onConnectState, 5000);
};

const prepareMatrix = (baseColor, fillColor, percaentage) => {
  let segmentsArray = [];
  const lightenLeds = Math.floor(percaentage * LedsPerPercent);

  for (i = 0; i < ROWS; i++) {
    let segLight;
    let segOff;
    if (i % 2 == 0) {
      segLight = {
        start: i * (LEDS / ROWS),
        stop: lightenLeds + 1 + i * (LEDS / ROWS),
        ...getSegmentColor(fillColor, lightenLeds),
        bri: 255,
        status: "LIGHTEN of first row",
      };
      segOff = {
        start: lightenLeds + i * (LEDS / ROWS) + 1,
        stop: (LEDS / ROWS) * (i + 1),
        bri: 255,
        ...getSegmentColor(baseColor, lightenLeds),
        status: "RED of first row",
      };
      segmentsArray.push(segLight, segOff);
    } else {
      segOff = {
        start: i * (LEDS / ROWS),
        stop: (LEDS / ROWS) * 2 - lightenLeds,
        // stop: lightenLeds + 1 + i * (LEDS / ROWS) - 1,
        bri: 255,
        ...getSegmentColor(baseColor, lightenLeds),
        status: "RED of second row",
      };
      segLight = {
        start: (LEDS / ROWS) * 2 - lightenLeds,
        stop: (LEDS / ROWS) * (i + 1),
        ...getSegmentColor(fillColor, lightenLeds),
        bri: 255,
        status: "LIGHTEN of second row",
      };

      segmentsArray.push(segLight, segOff);
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
    return;
  }
  if (shouldCheckTemps) {
    const temps = await get(`${OCTOPRINT}/api/printer`);
    const isReached = checkIfTempReached(
      temps.temperature.tool0.actual,
      temps.temperature.tool0.target
    );
    if (!isReached) {
      const percaentage =
        (temps.temperature.tool0.actual * 100) / temps.temperature.tool0.target;
      const json = prepareMatrix(
        "colorBlueBreath",
        "colorRedGradient",
        percaentage
      );
      console.log(json);
      console.log("posting temp heating state");
      return post(`${WLED}/json`, json);
    } else shouldCheckTemps = false;
  }
  const timeElapsed = Number((jobInfo.progress.printTime / 60).toFixed(2));
  const timeLeft = Number((jobInfo.progress.printTimeLeft / 60).toFixed(2));
  const overallTime = Number((timeElapsed + timeLeft).toFixed(2));
  const percaentage = Math.floor((timeElapsed * 100) / overallTime);
  if (percaentage === 100) return clearInterval(interval);
  console.log(timeElapsed, timeLeft, overallTime, percaentage);
  const json = prepareMatrix(
    "colorRedBreath",
    "colorGreenGradient",
    percaentage
  );
  console.log("posting print status state");
  post(`${WLED}/json`, json);
};
const printingState = () => {
  shouldCheckTemps = true;
  updateLeds();
  printInterval = setInterval(updateLeds, 3000);
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
  initiateLEDS,
  states,
  printingState,
};

function checkIfTempReached(actual, target) {
  if (target < 200) return false;
  console.log(Math.abs(actual - target) < 2);
  if (Math.abs(actual - target) < 2) return true;
  return false;
}

async function initiateLEDS() {
  const octoPrintStatus = await get(`${OCTOPRINT}/api/printer`);
  const wledStatus = await get(`${WLED}/json/info`);
  if (octoPrintStatus.err || wledStatus.err) return;
  if (octoPrintStatus.printerNotConnected) return errorState();
  console.log("octo up");
  switch (octoPrintStatus.state.text) {
    case "Operational":
      onConnectState();
      break;
    case "Printing":
      const isReached = checkIfTempReached(
        octoPrintStatus.temperature.tool0.actual,
        octoPrintStatus.temperature.tool0.target
      );

      if (isReached) shouldCheckTemps = false;
      printingState();
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
