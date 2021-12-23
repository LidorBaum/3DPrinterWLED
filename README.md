# 3DPrinterWLED

The project will show you the current state of your printer, and progress bar for live printing / heating through smart LEDs 

This project requires:
- Raspberry Pi with Octoprint installed (I used ESP8266 CH340)
- NeoPixel LEDs with ESP8266/ESP32 module (I used WS2812B)
- a 3D Printer (I used Biqu B1 SE Plus)

Features
***
This project will show you the current state of the printer.

|State               | Colors | Effect | Notes |
|------|--------|--------|-------|
|Unrecoverable error, Printer disconnected| Red-White|Blink|The printer has disconnected from octoprint or halted|
|Connected|Blue|Fade|The pritner is connected to octoprint and operational|
|Printing|Green-Red|Progress-Bar|The printer is printing and the LEDs showing a progress bar|
|Print Completed|Green|Fireworks|The printer has completed the print|
|Print Cancelling|Blue|Loading|The printer is cancelling the print|
|Filament Change|Blue-Violet|Running|The printer is waiting for filament change|
|Heating|Red-Blue|Progress-Bar|The printer is heating and the LEDs showing a progress bar|

