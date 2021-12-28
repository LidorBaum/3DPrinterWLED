const { get, post } = require("./httpService");
const { LEDS, ROWS, OCTOPRINT, WLED, APIKEY } = require("./config");
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
let currentPercentage = null;
let printIntervalTimerObj = {
  intervalId: null,
  interval: 3000,
  isUpdated: false,
};
let printerState = null;
let isOctoprintAliveInterval = null;

const switchState = (segmentsArray, printerNewState) => {
  const json = getLEDJson(segmentsArray);
  clearInterval(printIntervalTimerObj.intervalId);
  clearInterval(isOctoprintAliveInterval);
  shouldCheckTemps = true;
  printerState = printerNewState;
  resetPrintIntervalTimerObj();
  console.log(`posting ${printerNewState} state`);
  post(`${WLED}/json`, json);
};

const setNewPrintInterval = (newTimer) => {
  clearInterval(printIntervalTimerObj.intervalId);
  printIntervalTimerObj = { interval: newTimer, isUpdated: true };
  printIntervalTimerObj.intervalId = setInterval(updateLedsPrinting, newTimer);
};

const scheduleTimeout = (cb, timeout, expectedPrinterState) => {
  setTimeout(() => {
    if (printerState === expectedPrinterState) cb();
  }, timeout);
};
//prog need to reset the interval obj so the next print will fresh-start, both on last print completed or failed
const resetPrintIntervalTimerObj = () => {
  printIntervalTimerObj = {
    interval: 3000,
    isUpdated: false,
  };
};

//for future update
const turnOffLEDs = () => {
  const segmentsArray = [
    {
      start: 0,
      stop: LEDS,
      col: [
        [255, 0, , 0],
        [250, 250, 250, 0],
        [200, 0, 0, 0],
      ],
      bri: 0,
    },
    ...emptySegments,
  ];
  const json = getLEDJson(segmentsArray);
  console.log("posting No Octoprint state");
  post(`${WLED}/json`, json);
  return;
};

const getLEDJson = (segmentsArray) => {
  return {
    on: true,
    bri: 255,
    seg: segmentsArray,
  };
};

const checkIfTempReached = (actual, target) => {
  if (target < 185) return false;
  if (Math.abs(actual - target) < 2) return true;
  return false;
};

const checkIfOctoprintAlive = async () => {
  const res = await get(`${OCTOPRINT}/api/printer?apikey=${APIKEY}`);
  //if octo alive and the state is not connected
  if ((res.error || res.state) && printerState !== printerStates.connected) {
    return onConnectState();
  }

  //if the octo alive and the state is already connected
  if (res.error || res.state) return;

  //if octo not alive and the state is already disconnected
  if (res.err && printerState === printerStates.disconnected) return;

  //if octo not alive and the state is not disconnected
  if (res.err && printerState !== printerStates.disconnected) {
    return errorState();
  }
};

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

const octoprintLoading = () => {
  const segmentsArray = [
    {
      start: 0,
      stop: LEDS,
      col: [
        [0, 255, , 0],
        [250, 250, 250, 0],
        [200, 0, 0, 0],
      ],
      fx: 3,
      sx: 200,
      ix: 200,
    },
    ...emptySegments,
  ];
  switchState(segmentsArray, printerStates.waitingOctoprintStatup);
  return;
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
  switchState(segmentsArray, printerStates.disconnected);
  isOctoprintAliveInterval = setInterval(checkIfOctoprintAlive, 7000);
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
      bri: 255,
    },
    ...emptySegments,
  ];
  switchState(segmentsArray, printerStates.connected);
  isOctoprintAliveInterval = setInterval(checkIfOctoprintAlive, 7000);
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
  switchState(segmentsArray, printerStates.printCancelling);
  return;
};

const onCompletedPrintState = async () => {
  let segmentsArray = [];
  for (i = 0; i < ROWS; i++) {
    const seg = {
      start: (LEDS / ROWS) * i,
      stop: (LEDS / ROWS) * (i + 1),
      col: [
        [0, 255, 0, 0],
        [250, 250, 250, 0],
        [0, 0, 0, 0],
      ],
      fx: 90,
      sx: 55,
      ix: 20,
    };
    segmentsArray.push(seg);
  }
  segmentsArray.push(...emptySegments);
  switchState(segmentsArray, printerStates.connected);
  scheduleTimeout(onConnectState, 60000, printerStates.connected);
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
  switchState(segmentsArray, printerStates.waitingFilamentChange);
  currentPercentage = null;
  return;
};

const printCancelledState = () => {
  printerState = printerStates.printCancelling;
  scheduleTimeout(onConnectState, 7000, printerStates.printCancelling);
};

const printingState = () => {
  clearInterval(isOctoprintAliveInterval);
  shouldCheckTemps = true;
  printerState = printerStates.printing;
  updateLedsPrinting();
  printIntervalTimerObj.intervalId = setInterval(updateLedsPrinting, 3000);
};

const prepareMatrix = (baseColor, fillColor, percaentage) => {
  let segmentsArray = [];
  let lightenLeds = Math.floor(percaentage * LedsPerPercent + 1);
  if (lightenLeds === 0) lightenLeds = 1;
  for (i = 0; i < ROWS; i++) {
    let segLight;
    let segOff;
    if (i % 2 == 0) {
      segLight = {
        start: i * (LEDS / ROWS),
        stop: lightenLeds + i * (LEDS / ROWS),
        ...getSegmentColor(fillColor, lightenLeds),
        bri: 255,
        status: "LIGHTEN of first row",
      };
      segOff = {
        start: lightenLeds + i * (LEDS / ROWS),
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
  const json = getLEDJson(segmentsArray);
  return json;
};

const updateLedsPrinting = async () => {
  const jobInfo = await get(`${OCTOPRINT}/api/job?apikey=${APIKEY}`);
  if (jobInfo.err || jobInfo.printerNotConnected) {
    errorState();
  }
  if (jobInfo.progress.printTime === null) {
    if (isAlreadyOff) return;
    isAlreadyOff = true;
    return;
  }
  if (shouldCheckTemps) {
    const temps = await get(`${OCTOPRINT}/api/printer?apikey=${APIKEY}`);
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
      return post(`${WLED}/json`, json);
    } else shouldCheckTemps = false;
  }
  const timeElapsed = Number((jobInfo.progress.printTime / 60).toFixed(2));
  const timeLeft = Number((jobInfo.progress.printTimeLeft / 60).toFixed(2));
  const overallTime = Number((timeElapsed + timeLeft).toFixed(2));
  if (!printIntervalTimerObj.isUpdated) {
    if (overallTime < 60) setNewPrintInterval(10000);
    else setNewPrintInterval(40000);
  }
  const percaentage = Math.floor((timeElapsed * 100) / overallTime);
  if (percaentage === 100) return clearInterval(interval);
  if (percaentage === currentPercentage) return;
  currentPercentage = percaentage;
  const json = prepareMatrix(
    "colorRedBreath",
    "colorGreenGradient",
    percaentage
  );
  if (printerState !== printerStates.printing)
    printerState = printerStates.printing;
  post(`${WLED}/json`, json);
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

//for timeout schedules - so the leds won't show wrong state
const printerStates = {
  connected: "connected",
  printing: "printing",
  waitingFilamentChange: "waitingFilamentChange",
  printCancelling: "printCancelling",
  disconnected: "disconnected",
  waitingOctoprintStatup: "waitingOctoprintStatup",
};

const initiateLEDS = async () => {
  const octoPrintStatus = await get(
    `${OCTOPRINT}/api/printer?apikey=FCD5C4119908427AB46ED1F09AB28EED`
  );
  const wledStatus = await get(`${WLED}/json/info`);
  //if octo not responding but wled is alive
  if (octoPrintStatus.err && !wledStatus.err) {
    return errorState();
  }

  //if octo not responding or WLED not alive, nothing to procceed, waiting for mqtt
  if (octoPrintStatus.err || wledStatus.err) return;

  if (octoPrintStatus.printerNotConnected) return errorState();
  switch (octoPrintStatus.state.text) {
    case "Operational":
      printerState = printerStates.connected;
      onConnectState();
      break;
    case "Printing":
      const isReached = checkIfTempReached(
        octoPrintStatus.temperature.tool0.actual,
        octoPrintStatus.temperature.tool0.target
      );
      if (isReached) shouldCheckTemps = false;
      printerState = printerStates.printing;
      printingState();
      break;
    case "Cancelling":
      printerState = printerStates.printCancelling;
      onCancellingState();
      break;
    default:
      printerState = printerStates.connected;
      onConnectState();
      break;
  }
};

module.exports = {
  initiateLEDS,
  states,
  printingState,
  octoprintLoading,
};
