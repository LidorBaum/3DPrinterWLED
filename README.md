# 3DPrinterWLED

The project will show you the current state of your printer, and progress bar for live printing / heating through smart LEDs 

This project requires:
- Raspberry Pi with Octoprint installed (I used ESP8266 CH340)
- NeoPixel LEDs with ESP8266/ESP32 module (I used WS2812B)
- a 3D Printer (I used Biqu B1 SE Plus)

### Features
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

### How To Install
***
at first, you will install the WLED image on your ESP. [flasher](https://github.com/esphome/esphome-flasher/releases), [image](https://github.com/Aircoookie/WLED/releases)
after flashing, connect to the WLED via wifi - WLED-AP, password is wled1234. it will redirect you to the wled page, and there you need to connect the ESP to your home network.
you will need [Node.JS](https://nodejs.org/en/download/) to run the project.
download the source code of the project, open a terminal and run "npm i" to download all the dependencies.
on Octoprint, install the [plugin MQTT](https://plugins.octoprint.org/plugins/mqtt/) 
open ssh on your Raspberry Pi (ssh pi@{IPAddress}, your password is 'raspberry' by default), run the following commands:
1. sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
2. sudo apt-get update
3. sudo apt-get install mosquitto
4. sudo apt-get install mosquitto-clients
5. sudo nano /etc/mosquitto/mosquitto.conf - in this file, enter on the top of the file (after the # lines) - 'allow_anonymous true', press Ctrl X and Save.
6. sudo systemcel restart mosquitto
7. mosquitto_sub -h localhost -p 1883 -t '#'

Go to Octoprint-settings-MQTT (under plugins) - 
Host - your Raspberry Pi IP
Port - 1883

After that, you should see in the terminal window with the Pi's ssh all the octoprint events, such as temps, jobs, etc.

Go to the project in your editor (Visual Studio Code, etc.), and modify the config.js file according to your parameters. 
host & OCTOPRINT - your raspberry pi IP, should be the same
MQTTport - should be 1883 if you did not change it
WLED - the IP of the ESP
LEDS - how many LEDs you are using
ROWS - how many rows are there in your arrangement (you can use matrix leds)
