const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3700;
require(`dotenv`).config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(
    `${"*".repeat(16)}\r\n>> App running on port ${PORT}!\r\n${"*".repeat(16)}`
  );
});
