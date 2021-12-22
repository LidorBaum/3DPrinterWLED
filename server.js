const Axios = require("axios");
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http").createServer(app);

console.log('test');

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
    res.send('hi');
});

const port =  4444;
http.listen(port, () => console.log(`Listening on port ${port}...`));

const axios = Axios.create({
    withCredentials: true,
    headers: {
        "accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        "User-Agent": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        "Cookie": "remember_token_P80=sabaum|bdfb46e3749f7ae3e6ee25e5ef8ea2f7c4e9225d98905563e3b800836918560f7448423b4a0aa17ac2499614843ac1ee803fc6f8268f2a18270f43f1de251a7d; session_P80=.eJxVj0tuwzAQQ--idVHoM6OPdw7aXsMYa0a1AccJLHkRFL17VWTTbvlIgvxSUzmkLmpoxykvalpZDSoQzhEi-BBnoCLeInFGiOTYs9UOci4mYYGUcnIwE5OwZBeRE7lAzBY0A9tkCQl9cZCiDgZ0DJgwSQ46oJQ8WyrZGZOle6IYsFkbo_qQs8rxXFNppvPatZVlb2t7vNLZlqk97qKG_dy2P-R_YLt9rvt0lbzQvtZrR0tr9w5-y6vUut72ZwTBe31xyY-6Hx9x_EgIo3l7N0mj16i-fwAnT1nj.YcJCXw.yPqw_TJnS3uvc6Igq_SxkVJQ0mM"
    }
});
const get = (endpoint, data) => {
    return ajax(endpoint, "GET", data)
}
const post = (endpoint, data) => {
    return ajax(endpoint, "POST", data)
}

async function ajax(endpoint, method = "get", data = null) {
    try {
        const res = await axios({
            url: `${endpoint}`,
            method,
            data,
        });
        return res.data;
    } catch (err) {
        console.log(err);
        return "Unable to fetch"
    }
}
let isOn = false
async function run() {
    // setInterval(() => {
        fetchim()
    // }, 3000);
}

const LEDS = 20

const LedsPerPercent = LEDS/100 //1 or 2

const prepareSegments = (percaentage) => {
    let segmentsArray = []
    const lightenLeds = percaentage * LedsPerPercent
    console.log(lightenLeds); //SHOULD BE 
    let segLight = {
        start: 0,
        stop: lightenLeds - 2,
        "col": [
            [0, 160, 255, 0],
            [200, 50, 180, 0],
            [0, 0, 0, 0]
        ],
        "fx": 46,
        "sx": 200,
        "ix": 6,
        bri: 255,
    }
    let segFlash = {
        start: lightenLeds - 2,
        stop: lightenLeds + 1,
        "col": [
            [0, 160, 255, 0],
            [250, 0, 0, 0],
            [0, 0, 250, 0]
        ],
        "fx": 46,
        "sx": 100,
        "ix": 6,
        bri: 100
    }
    let segOff = {
        start: lightenLeds + 1,
        stop: LEDS,
        bri: 0
    }
    segmentsArray.push(segLight, segFlash, segOff)

    const json = {
        on: true,
        bri: 255,
        seg: segmentsArray
    }
    return json
}


async function fetchim() {
    // const res = await get('http://192.168.1.37/json')
    // console.log(res);
    // const jobInfo = await get('http://192.168.1.11/api/job')
    // const timeElapsed = Number((jobInfo.progress.printTime / 60).toFixed(2))
    // const timeLeft = Number((jobInfo.progress.printTimeLeft / 60).toFixed(2))
    // const overallTime = Number((timeElapsed + timeLeft).toFixed(2))
    // const percaentage = Math.floor((timeElapsed * 100 / overallTime))
    // console.log(timeElapsed, timeLeft, overallTime, percaentage);
    let i = 10
    while(i<100){
    setTimeout(() => {
        const json = prepareSegments(i)
    console.log(json);
    post('http://192.168.1.37/json', json)
    i += 10
    }, 2000);
    }
}

run()
