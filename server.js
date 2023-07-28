const express = require("express");
const axios = require("axios");
require("dotenv").config();
const key = process.env.API_KEY;
const app = express();
var port = 3000;
const url = "https://api.pipedrive.com/v1/deals";

app.use(express.json());

// Taken from https://ipirozhenko.com/blog/measuring-requests-duration-nodejs-express/
const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

// metrics object that will hold the data
var metrics = {
  GET: [],
  POST: [],
  PUT: [],
};

// middleware for metrics, we need to get the request duration
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const duration = getDurationInMilliseconds(start);
    const method = req.method;
    const date = new Date().toLocaleString();
    console.log(metrics);

    if (metrics[method].length > 0) {
      // Modify the fields of the last metric object, to add the total duration
      const last = metrics[method][metrics[method].length - 1];
      last.duration = duration;
      last.date = date;
    } else {
      metrics[method].push({ duration, method });
    }
  });
  next();
});

// GET DEALS
app.get("/deals", async (req, res) => {
  // get deals accepts query params, if any present we will use them in our request
  const queryParams = req.query;
  console.log("Query params: ", queryParams);
  const start = process.hrtime();
  try {
    const response = await axios.get(url, {
      params: {
        api_token: key,
        ...queryParams,
      },
    });

    const duration = getDurationInMilliseconds(start);
    var data = response.data.data;
    if (data.length > 0) {
      console.log("Deals retreived");
      res.json(data);
    } else {
      console.log("Your deals are empty");
      res.json("No deals were found");
    }

    // add metric data for the GET endpoints
    metrics.GET.push({
      latency: duration,
      method: "GET",
      statusCode: res.statusCode,
    });
  } catch (error) {
    if (error.response) {
      console.log("Error creating a deal, error data: ", error.response.data);
      res.status(error.response.status).json({
        error: error.code,
        info: error.response.data.error,
        status: error.response.data.success,
      });
    } else {
      res.status(500).json({
        error: "Error occurred when requesting Pipedrive API",
        message: error.message,
      });
    }
  }
});

// POST local endpoint
app.post("/deals", async (req, res) => {
  const start = process.hrtime();
  try {
    const response = await axios.post(url, req.body, {
      params: {
        api_token: key,
      },
    });
    const duration = getDurationInMilliseconds(start);
    console.log("Deal created.");
    res.json(response.data);

    // add metric data for the POST endpoint.
    metrics.POST.push({
      latency: duration,
      method: "POST",
      statusCode: response.statusCode,
    });
  } catch (error) {
    if (error.response) {
      console.log("Error creating a deal, error data: ", error.response.data);
      res.status(error.response.status).json({
        error: error.code,
        info: error.response.data.error,
        status: error.response.data.success,
      });
    } else {
      res.status(500).json({
        error: "Error occurred when requesting Pipedrive API",
        message: error.message,
      });
    }
  }
});

// PUT local endpoint
app.put("/deals", async (req, res) => {
  const start = process.hrtime();
  try {
    var id = req.query.id;
    if (!id) {
      return res.status(400).json("No deal id provided in body.");
    }
    const response = await axios.put(url + "/" + id, req.body, {
      params: {
        api_token: key,
      },
    });

    console.log("Deal Updated, id of deal: ", id);

    // duration of the request
    const duration = getDurationInMilliseconds(start);
    res.json(response.data);
    metrics.PUT.push({
      latency: duration,
      method: "PUT",
      statusCode: response.statusCode,
    });
  } catch (error) {
    if (error.response) {
      console.log("Error updating a deal, error info: ", error.response.data);
      res.status(error.response.status).json({
        error: error.code,
        info: error.response.data.error,
        status: error.response.data.success,
      });
    } else {
      res.status(500).json({
        error: "Error occurred when requesting Pipedrive API",
        message: error.message,
      });
    }
  }
});

// Metrics endpoint
app.get("/metrics", (req, res) => {
  res.json(metrics);
});

var server = app.listen(port, () => {
  console.log("Local API is running on port " + port);
});

module.exports = { app, server, metrics };
