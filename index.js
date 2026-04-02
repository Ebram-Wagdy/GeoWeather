import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", async (req, res) => {
  const lat = 30.0444;
  const lon = 31.2357;

  const api_call = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  try {
    const result = await axios.get(api_call);
    const data = result.data;
    const weatherData = {
      temp: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      time: data.current_weather.time,
    };
    res.render("index.ejs", { weatherData, lat, lon, city: "Cairo" });
  } catch (error) {
    console.log(error);
    res.send("Error fetching weather");
  }
});

app.get("/weather", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const api_new = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  try {
    const result = await axios.get(api_new);
    const data = result.data;

    const weatherData = {
      temp: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      time: data.current_weather.time,
    };

    const geoApi = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
    const geoRes = await axios.get(geoApi, {
      headers: {
        "User-Agent": "weather-app (student project)",
      },
    });

    let city = "Unknown location";

    if (geoRes.data.address) {
      city =
        geoRes.data.address.city ||
        geoRes.data.address.town ||
        geoRes.data.address.village ||
        geoRes.data.address.country;
    }

    res.render("index.ejs", { weatherData, lat, lon, city });
  } catch (error) {
    console.log(error);
    res.send("Error fetching weather");
  }
});

app.get("/search", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).send("City is required");
  }

  try {
    const api = `https://nominatim.openstreetmap.org/search?q=${city}&format=json&accept-language=en`;
    const geo = await axios.get(api, {
      headers: {
        "User-Agent": "weather-app",
      },
    });

    if (!geo.data || geo.data.length === 0) {
      return res.send("City not found");
    }

    const place = geo.data[0];

    const lat = place.lat;
    const lon = place.lon;

    const cityName = place.display_name?.split(",")[0] || "Unknown location";

    const api_new = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const result = await axios.get(api_new);
    const data = result.data;

    const weatherData = {
      temp: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      time: data.current_weather.time,
    };

    res.render("index.ejs", { weatherData, lat, lon, city: cityName });
  } catch (error) {
    console.log("Error Occured");

    console.log("Name:", error.name);

    console.log("Message:", error.message);

    console.log("Code:", error.code);

   
    if (error.response) {
      console.log("Response status:", error.response.status);
      console.log("Response data:", error.response.data);
    }

    console.log(error);

    res.status(500).send("Error fetching weather");
  }
});

app.listen(port, () => {
  console.log(`listening on port${port}`);
});
