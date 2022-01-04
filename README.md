# 3DPrinterWLED

The project will show you the current state of your printer, and progress bar for live printing / heating through smart LEDs
<p align="center">
    <a href="https://www.youtube.com/watch?v=hYJJ91rFYmg">
<img src="https://res.cloudinary.com/echoshare/image/upload/v1641316267/Untitled-4_mdepf9.jpg" width="250"  />
        <a />
        <br />
        Click the image to open YouTube video demo
<p />
<br />
This project requires:

- Raspberry Pi with Octoprint installed (I used Pi 4B 4GB)
- NeoPixel LEDs with ESP8266/ESP32 module (I used WS2812B LEDs and ESP8266 CH340)
- a 3D Printer (I used Biqu B1 SE Plus)

### Features

---

This project will show you the current state of the printer.

| State                                                                            | Colors      | Effect       | Notes                                                       |
| -------------------------------------------------------------------------------- | ----------- | ------------ | ----------------------------------------------------------- |
| Unrecoverable error, Printer disconnected, or Octoprint server is not responding | Red-White   | Blink        | The printer has disconnected from octoprint or halted       |
| Connected                                                                        | Blue        | Fade         | The printer is connected to octoprint and operational       |
| Printing                                                                         | Green-Red   | Progress-Bar | The printer is printing and the LEDs showing a progress bar |
| Print Completed                                                                  | Green       | Fireworks    | The printer has completed the print                         |
| Print Cancelling                                                                 | Blue        | Loading      | The printer is cancelling the print                         |
| Filament Change                                                                  | Blue-Violet | Running      | The printer is waiting for filament change                  |
| Heating                                                                          | Red-Blue    | Progress-Bar | The printer is heating and the LEDs showing a progress bar  |

### How To Install

---

At first, you will flash the WLED image on your ESP. [flasher](https://github.com/esphome/esphome-flasher/releases), [image](https://github.com/Aircoookie/WLED/releases) <br />
after flashing, connect to the WLED via wifi - WLED-AP, password is wled1234. <br />
it will redirect you to the wled page, and there you need to connect the ESP to your home network. <br />

on Octoprint, install the [plugin MQTT](https://plugins.octoprint.org/plugins/mqtt/), and then restart octoprint server <br />
<br />
Get your Raspberry Pi's IP address (192.168.1.xx, 10.10.10.x, etc) <br />
Open cmd or terminal in your pc, and connect to the Pi via ssh. (`ssh pi@<IPAddress>`, your password is 'raspberry' by default) <br />
Run the following commands: <br />

1. `sudo apt-get update`
2. `sudo apt-get install mosquitto`
3. `sudo apt-get install mosquitto-clients`
4. `sudo nano /etc/mosquitto/mosquitto.conf` - in this file, enter on the top of the file (after the # lines) - `'allow_anonymous true'`, press Ctrl X and Save.
5. `sudo systemctl restart mosquitto`
6. `sudo apt install nodejs`
7. `sudo apt install npm`
8. `sudo apt-get update`
9. `sudo apt-get upgrade`
10. `sudo npm install -g n`
11. `sudo n stable`
12. `sudo reboot`
    <br />
    wait for your raspberry to reboot, and connect to via ssh again.

<br />

Clone the repository to the raspberry pi. enter the commands: <br />

1. `cd /home/pi`
2. `git clone https://github.com/LidorBaum/3DPrinterWLED.git`

After the cloning succeeded, configure the program with your own parameters: <br />

1. `cd /home/pi/3DPrinterWLED`
2. `sudo nano config.js` <br />
   host & OCTOPRINT - your raspberry pi IP, should be the same address. keep the original pattern <br />
   MQTTport - should be 1883 if you did not change it <br />
   WLED - the IP of the ESP <br />
   LEDS - how many LEDs you are using <br />
   ROWS - how many rows are there in your arrangement (you can use matrix leds) <br />
   APIKEY - Octoprint API Key, can be found in settings -> API -> global api key. <br />
   To save the config, press CTRL X , Y , ENTER <br />
   Enter command `npm i` to install all the dependencies of the project

3. Go to octoprint in the browser, Go to settings -> MQTT (under plugins) - <br />
   Host - your Raspberry Pi IP <br />
   Port - 1883 <br />
   Uncheck the 'Enable retain flag' option <br />
   Hit save <br/>
   In ssh, clean the old events from the MQTT service:
4. `sudo systemctl stop mosquitto.service`
5. `sudo rm /var/lib/mosquitto/mosquitto.db`
6. `sudo systemctl start mosquitto.service`

Enter the following command to listen to octoprint events: <br />

- `mosquitto_sub -h localhost -p 1883 -t '#'` <br />
  Test your connection - press printer connect and disconnect in octoprint in the browser, <br />
  and you should see the events for connect and disconnect in the terminal.

Create the service for the program, so it will run automatically on the raspberry startup: <br />
Press CTRL C to exit the listening to the MQTT, and enter the command: <br />

- `sudo nano /etc/systemd/system/led.service` <br />
  this will create a new empty file
  the following code is the service. <br />
  you can copy and paste it to the file you created.

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

Save the file - CTRL X, Y, Enter <br />
run `systemctl enable led` to enable the script to run on startup. <br />

Now restart your Raspberry Pi and LEDS (unplug and plug). <br />
That's it, your LEDs supposed to be all up and running, according to the printer's state.
Have fun!

### Notes

---

I recommend installing [Print Time Genius](https://plugins.octoprint.org/plugins/PrintTimeGenius/) octoprint plugin for better progress bar accuracy.
