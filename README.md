# 3DPrinterWLED

The project will show you the current state of your printer, and progress bar for live printing / heating through smart LEDs

This project requires:

- Raspberry Pi with Octoprint installed (I used Pi 4B 4GB)
- NeoPixel LEDs with ESP8266/ESP32 module (I used WS2812B LEDs and ESP8266 CH340)
- a 3D Printer (I used Biqu B1 SE Plus)

### Features

---

This project will show you the current state of the printer.

| State                                     | Colors      | Effect       | Notes                                                       |
| ----------------------------------------- | ----------- | ------------ | ----------------------------------------------------------- |
| Unrecoverable error, Printer disconnected, or Octoprint server is not responding | Red-White   | Blink        | The printer has disconnected from octoprint or halted       |
| Connected                                 | Blue        | Fade         | The printer is connected to octoprint and operational       |
| Printing                                  | Green-Red   | Progress-Bar | The printer is printing and the LEDs showing a progress bar |
| Print Completed                           | Green       | Fireworks    | The printer has completed the print                         |
| Print Cancelling                          | Blue        | Loading      | The printer is cancelling the print                         |
| Filament Change                           | Blue-Violet | Running      | The printer is waiting for filament change                  |
| Heating                                   | Red-Blue    | Progress-Bar | The printer is heating and the LEDs showing a progress bar  |

### How To Install

---
At first, you will flash the WLED image on your ESP. [flasher](https://github.com/esphome/esphome-flasher/releases), [image](https://github.com/Aircoookie/WLED/releases) <br />
after flashing, connect to the WLED via wifi - WLED-AP, password is wled1234. <br />
it will redirect you to the wled page, and there you need to connect the ESP to your home network. <br />
on Octoprint, install the [plugin MQTT](https://plugins.octoprint.org/plugins/mqtt/), and then restart octoprint server <br />
<br />
Get your Raspberry Pi's IP address (192.168.1.xx, 10.10.10.x, etc) <br />
open cmd or terminal in your pc, and connect to the Pi via ssh. (`ssh pi@<IPAddress>`, your password is 'raspberry' by default), <br />
run the following commands: <br />

1. sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
2. sudo apt-get update
3. sudo apt-get install mosquitto
4. sudo apt-get install mosquitto-clients
5. sudo nano /etc/mosquitto/mosquitto.conf - in this file, enter on the top of the file (after the # lines) - 'allow_anonymous true', press Ctrl X and Save.
6. sudo systemctl restart mosquitto
7. sudo apt install nodejs
8. sudo apt install npm
9. sudo apt-get update
10. sudo apt-get upgrade
<br />

now we need to clone the repository to the raspberry pi. enter the commands: <br />
1. cd /home/pi
2. git clone https://github.com/LidorBaum/3DPrinterWLED.git

after the cloning succeeded, you need to configure the program with your own parameters <br />
1. cd /home/pi/3DPrinterWLED
2. sudo nano config.js <br />
host & OCTOPRINT - your raspberry pi IP, should be the same address. keep the original pattern <br />
MQTTport - should be 1883 if you did not change it <br />
WLED - the IP of the ESP <br />
LEDS - how many LEDs you are using <br />
ROWS - how many rows are there in your arrangement (you can use matrix leds) <br />
To save the config, press CTRL X , Y , ENTER <br />
Now go to octoprint in the browser, Go to settings -> MQTT (under plugins) - <br />
Host - your Raspberry Pi IP <br />
Port - 1883 <br />

back to the pi's ssh terminal, enter the command: <br />
* mosquitto_sub -h localhost -p 1883 -t '#'
Now test your connection - press connect and disconnect on your octoprint on the browser, <br />
and you should see the events for connect and disconnect on the terminal.

Now you need to create the service for the program, so it will run automatically on the raspberry startup. <br />
Press CTRL C to exit the listening to the MQTT, and enter the command: <br />
* sudo nano /etc/systemd/system/led.service <br />
this is the content of the file, you can copy it, and paste on the terminal with right-click.
```                        
[Unit]
Description="3DPrinterWLED-LidorBaum"

[Service]
ExecStart=/usr/local/bin/node server.js
Type=simple
User=root
WorkingDirectory=/home/pi/3DPrinterWLED
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=led

[Install]
WantedBy=multi-user.target
```
Now save - CTRL X, Y, Enter
Now restart your raspberry and LEDS (unplug and plug). <br />
That's it, your LEDs supposed to be all up and running, according to the printer's state.
Have fun!
