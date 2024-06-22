const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./Routes/authRoutes");
const emailRoutes = require("./Routes/emailRoutes");
const analysisRoutes = require("./Routes/analysisRoutes");
const customerRoutes = require("./Routes/customerRoutes");
const calendarRoutes = require("./Routes/calendarRoutes");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.use(authRoutes);
app.use(emailRoutes);
app.use(analysisRoutes);
app.use(customerRoutes);
app.use(calendarRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
