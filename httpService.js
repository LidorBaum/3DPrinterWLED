const Axios = require("axios");

const axios = Axios.create({
  withCredentials: true,
  headers: {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "User-Agent":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    Cookie:
      "remember_token_P80=sabaum|bdfb46e3749f7ae3e6ee25e5ef8ea2f7c4e9225d98905563e3b800836918560f7448423b4a0aa17ac2499614843ac1ee803fc6f8268f2a18270f43f1de251a7d; session_P80=.eJxVj0tuwzAQQ--idVHoM6OPdw7aXsMYa0a1AccJLHkRFL17VWTTbvlIgvxSUzmkLmpoxykvalpZDSoQzhEi-BBnoCLeInFGiOTYs9UOci4mYYGUcnIwE5OwZBeRE7lAzBY0A9tkCQl9cZCiDgZ0DJgwSQ46oJQ8WyrZGZOle6IYsFkbo_qQs8rxXFNppvPatZVlb2t7vNLZlqk97qKG_dy2P-R_YLt9rvt0lbzQvtZrR0tr9w5-y6vUut72ZwTBe31xyY-6Hx9x_EgIo3l7N0mj16i-fwAnT1nj.YcJCXw.yPqw_TJnS3uvc6Igq_SxkVJQ0mM",
  },
});

const get = (endpoint, data) => {
  return ajax(endpoint, "GET", data);
};
const post = (endpoint, data) => {
  return ajax(endpoint, "POST", data);
};

async function ajax(endpoint, method = "get", data = null) {
  try { 
    const res = await axios({
      url: `${endpoint}`,
      method,
      data,
    });
    return res.data;
  } catch (err) {
    // console.log("couldnyt fetch", err.response?.data, err.response?.status, " status");
    if (err.response?.status === 409)
      return { printerNotConnected: "printerNotConnected" };
    return { err: "could not fetch" };
  }
}

module.exports = {
  get,
  post,
};
