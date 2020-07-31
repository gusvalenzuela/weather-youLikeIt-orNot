const express = require("express")
const path = require("path")
const app = express()
const PORT = process.env.PORT || 3700
require("dotenv").config()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static("client"))

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "./client/index.html"))
})

// Start the server
app.listen(PORT, () => {
	console.log(`\n\t-------> App running on PORT ${PORT}!\n`)
})
