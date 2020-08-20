/*global Promise, moment, Set, placeSearch*/
/*eslint no-undef: "error"*/
import "../css/style.css"
import "core-js/stable" // for async functionality
import "regenerator-runtime/runtime" //	for async functionality
const searchForm = document.getElementById("search-form")
const searchInput = document.getElementById("search-input")
const geoButton = document.getElementById("geo-button")
const historyDiv = document.getElementById("history-div")
const noHistoryDiv = document.getElementById("no-history")
var searchHistory = []
var currentCityTZ = 0 // holding current timezone

const grabWeather = async city => {
	var Locations, City
	// checking if being sent name or coordinates
	if (typeof city === "string") {
		// first convert to coordinates
		Locations = await convertTo("coords", city)
		// get weather from first of locations grabbed above
		City = await getWeatherData(Locations[0].latLng)
	} else {
		// if search term not string get weather from provided coords (this assumes coords are coming in)
		City = await getWeatherData({ lat: city.latitude, lng: city.longitude })
		// convert to city name (for saving in search history)
		Locations = await convertTo("name", city)
	}

	City.name = `${Locations[0].adminArea5}, ${Locations[0].adminArea3}` // save name to our handy City obj
	searchHistory.push(City.name) // save search term to history array
	searchHistory = [...new Set(searchHistory.reverse())].reverse() // filtering out dupes, double reverse to keep most recent up top
	localStorage.setItem(`WbGV-search-history`, JSON.stringify(searchHistory)) // save history to local storage

	render(City) // render City weather data on screen
	printHistory()
}

const convertTo = (type, searchterm) => {
	var convertRequest = new XMLHttpRequest()
	/* 
		type === "coords" 
		uses "address" endpoint of API to get coordinates from city name
		the searchterm is searched literally, as a city name is expected

		type === "name" 
		uses "reverse" endpoint of API to get location information (i.e. city name, state) from coordinates
		the searchterm is converted to string using its lat and lon properties, as a city obj is expected
	*/
	return new Promise(resolve => {
		const URL = `https://www.mapquestapi.com/geocoding/v1/${
			type === "coords" ? "address" : "reverse"
		}?key=${`4S11JlnMWVUPrva4271IE6m3AXotzHMJ`}&location=${
			type === "coords"
				? searchterm
				: searchterm.latitude + "," + searchterm.longitude
		}`
		convertRequest.open("GET", URL, true)
		convertRequest.send()
		convertRequest.onloadend = () => {
			let response = JSON.parse(convertRequest.response)
			resolve(response.results[0].locations)
		}
	})
}
const getWeatherData = ({ lat, lng: lon }) => {
	// Create a request variable and assign a new XMLHttpRequest object to it.
	var request = new XMLHttpRequest()
	return new Promise((resolve, rej) => {
		let URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&
    exclude=minutely,hourly&appid=${`a49df28db557e1be1c568c4992f04aec`}&units=imperial`
		request.open("GET", URL, true)
		request.send() // Send request
		request.onloadend = function () {
			if (request.status >= 200 && request.status < 400) {
				resolve(JSON.parse(request.response)) // response saved in request instance on load ends
			} else {
				rej(`error`)
			}
		}
	})
}
const getTime = () => {
	// converts current time (when called) to a specified timezone and formats it accordingly
	return moment().utcOffset(currentCityTZ).format(`ddd MMM Do LT`)
}

const render = city => {
	noHistoryDiv.style.display = "none"
	document.querySelector(".main-content").style.display = "flex"
	// console.log(city)
	let d = document
	// storing the currently selected city's timezone in global for refreshing
	// time is updated every second (using this timezone)
	currentCityTZ = city.timezone_offset / 60

	// city name
	d.querySelector(`#current-city-name`).textContent = city.name
	// temp image/icon
	d.querySelector(`#temp-icon`).setAttribute(
		`src`,
		`./weather-icons/${city.current.weather[0].icon}.svg`,
		// `https://openweathermap.org/img/wn/${city.current.weather[0].icon}@2x.png`,
	)
	//temperature
	d.querySelector(`#current-temp`).textContent = `${city.current.temp.toFixed(
		0,
	)}°F`
	// feels like
	d.querySelector(
		`#current-temp-feels`,
	).textContent = `Feels like: ${city.current.feels_like.toFixed(0)}°F`
	// humidity
	d.querySelector(
		`#current-humidity`,
	).innerHTML = `Humidity: <b>${city.current.humidity}%</b>`
	// wind
	d.querySelector(
		`#current-windspeed`,
	).innerHTML = `Wind Speed: <b>${city.current.wind_speed}MPH</b>`
	// color coding uvi-index div
	if (city.current.uvi) {
		let uviElement = d.querySelector(`#current-uvindex`)
		uviElement.innerHTML = city.current.uvi // setting the text content

		const uvi = Math.floor(city.current.uvi)
		// changing bg-color of parent element (div)
		if (uvi >= 11) {
			uviElement.className = `uvi-violet`
		} else if (uvi >= 8) {
			uviElement.className = `uvi-red`
		} else if (uvi >= 6) {
			uviElement.className = `uvi-orange`
		} else if (uvi >= 3) {
			uviElement.className = `uvi-yellow`
		} else if (uvi >= 0) {
			uviElement.className = `uvi-green`
		}
	}

	// forecast
	city.daily.forEach((day, ind) => {
		// show only last 7 days
		if (ind > 0) {
			// grab each forecast div by id
			let div = document.querySelector(`.forecast[id="${ind}"]`)

			div.innerHTML = `
			<p>${moment.unix(day.dt).utcOffset(currentCityTZ).format("dddd, M/D")}</p>
			<img src="./weather-icons/${day.weather[0].icon}.svg"/>
			<p style="float:right;">
			<span style="color: red">H:</span> ${day.temp.max.toFixed(0)}°F
			<br/>
			<span style="color: blue">L:</span> ${day.temp.min.toFixed(0)}°F
			</p>
			`
		}
	})
}

function printHistory() {
	historyDiv.innerHTML = ""
	historyDiv.append(`Search History:`)
	var x = 0
	if (searchHistory.length > 8) {
		// if searchHistory has more than 7 entries only display the latest 7, otherwise display all.
		x = searchHistory.length - 8 // sets the index of the 7th-to-last
	} else if (searchHistory.length === 0) {
		// if no history found, type it out loud
		let msg = (document.createElement(
			"span",
		).textContent = ` (No search history)`)
		historyDiv.append(msg)
	}
	// loop through searchHistory array and make button for each
	for (let i = searchHistory.length - 1; i >= x; i--) {
		let span = document.createElement(`span`)
		// if last item, don't append a pipe
		span.innerHTML = `<button onclick="gotoTop()" class="history-list-items">${
			searchHistory[i]
		}</button>${i > x + 1 ? "|" : ""}`
		historyDiv.append(span)
	}

	// creating an element to hold our "clear history" icon
	let clearHistoryIcon = document.createElement("button")
	clearHistoryIcon.classList.add("clear-history")
	clearHistoryIcon.setAttribute("id", "clear-history")
	clearHistoryIcon.setAttribute("name", "Clear Search History")
	clearHistoryIcon.setAttribute("title", "Clear Search History")

	historyDiv.append(clearHistoryIcon)
}

document.body.onload = init

function init() {
	setInterval(() => {
		// refreshes the time displayed every second
		// the time is changed in function via the timezone set in "grab weather"
		document.getElementById(`current-city-date`).textContent = `${getTime()}`
	}, 1000)

	// loads the easy to use PlaceSearch.js
	// provided by MapQuest: https://developer.mapquest.com/documentation/place-search-js/v1.0/
	placeSearch({
		key: `4S11JlnMWVUPrva4271IE6m3AXotzHMJ`,
		container: searchInput,
		limit: 7,
		collection: ["address", "adminArea"],
	})

	// L I S T E N E R S
	historyDiv.onclick = e => {
		e.preventDefault()
		// re-run search if any of "history" searches is clicked
		if (e.target.nodeName === "BUTTON") {
			// except if it's the clear history button
			if (e.target.id === "clear-history") {
				// in which case ask to confirm clearing search history
				let clear = confirm(
					"Are you sure you want to clear your search history?",
				)
				// if yes
				if (clear) {
					// clear the global array
					searchHistory = []
					// replace locally stored search history with empty array
					localStorage.setItem(
						`WbGV-search-history`,
						JSON.stringify(searchHistory),
					)
					// print history to re-render the history element
					printHistory()
				}
			} else {
				grabWeather(e.target.innerText)
			}
		}
	}

	// search form
	searchForm.onsubmit = e => {
		e.preventDefault()
		// grab data from weather api
		grabWeather(searchInput.value.trim().toLowerCase())
	}
	// geolocation button
	geoButton.onclick = e => {
		e.preventDefault()
		// grab data from weather api
		grabWeatherbyCoords()
	}

	// search history is locally stored
	// this retrieves any if found and displays it on the screen
	if (JSON.parse(localStorage.getItem(`WbGV-search-history`)) !== null) {
		searchHistory = JSON.parse(localStorage.getItem(`WbGV-search-history`))
		grabWeather(searchHistory[searchHistory.length - 1]) // last city searched to display on load, if any found
		printHistory()
	} else {
		// if no history is found
		noHistoryDiv.innerHTML = `<h1>Begin your search 👆</h1>`
		noHistoryDiv.style.display = "block"
	}
}

const grabWeatherbyCoords = () => {
	window.navigator.geolocation.getCurrentPosition(d => {
		grabWeather(d.coords) // if user allows location to be known
	})
}

// const grabCityImage = city => {
// 	//   $.ajax({
// 	//     url:
// 	//       "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" +
// 	//       currCit.name +
// 	//       "&inputtype=textquery&fields=photos&key=" +
// 	//       ak,
// 	//     method: "GET",
// 	//   }).then(function (imgresponse) {
// 	//     console.log(currCit.name);
// 	//     console.log(imgresponse);
// 	//   });
// }
