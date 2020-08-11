/*global Promise, moment, Set, placeSearch, $*/
/*eslint no-undef: "error"*/
import "../css/style.css"
import "core-js/stable" //	for async functionality
import "regenerator-runtime/runtime" //	for async functionality
const searchForm = document.querySelector(`#search-form`)
const searchInput = document.querySelector(`#search-input`)
const historyDiv = document.getElementById(`history-div`)
var searchHistory = []
var currentCityTZ = 0
// Create a request variable and assign a new XMLHttpRequest object to it.
var request = new XMLHttpRequest()
var convertRequest = new XMLHttpRequest()

const grabWeather = async cityname => {
	try {
		// get locations from search term
		let Locations = await convertToCoords(cityname)
		// get weather from first of locations grabbed above
		let City = await pullsiez(Locations[0].latLng)
		// save name to our handy City obj
		City.name = `${Locations[0].adminArea5}, ${Locations[0].adminArea3}`
		searchHistory.push(City.name) // save search term to history array
		searchHistory = [...new Set(searchHistory.reverse())].reverse() // filtering out dupes, double reverse to keep most recent up top
		localStorage.setItem(`WbGV-search-history`, JSON.stringify(searchHistory)) // save history to local storage
		// render City data on screen
		render(City)
		printHistory()
	} catch (error) {
		console.log(error)
	}
}

const convertToCoords = searchterm => {
	return new Promise(resolve => {
		const URL = `https://www.mapquestapi.com/geocoding/v1/address?key=${`4S11JlnMWVUPrva4271IE6m3AXotzHMJ`}&location=${searchterm}`
		convertRequest.open("GET", URL, true)
		convertRequest.send()
		convertRequest.onloadend = () => {
			let response = JSON.parse(convertRequest.response)
			resolve(response.results[0].locations)
		}
	})
}
const pullsiez = ({ lat, lng: lon }) => {
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
	return moment().utcOffset(currentCityTZ).format(`ddd MMM Do LT`)
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

const render = city => {
	console.log(city)
	let d = document
	// storing the currently selected city's timezone in global for refreshing
	// city date/time
	// this is updated every second
	currentCityTZ = city.timezone_offset / 60

	// city name
	d.querySelector(`#current-city-name`).textContent = city.name
	// temp image/icon
	d.querySelector(`#temp-icon`).setAttribute(
		`src`,
		`./weather-icons/${city.current.weather[0].icon}.svg`,
		// `https://openweathermap.org/img/wn/${city.current.weather[0].icon}@2x.png`,
	)
	//temp
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
		if (uvi > 11) {
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
		if (ind < 1) {
			return
		} else {
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
	// find how to make the list collapsible on sm screens (with classes)
	historyDiv.innerHTML = ""

	historyDiv.append(`Search History:`)
	var x = 0
	// if searchHistory has more than 7 entries only display the latest 7, otherwise display all.
	if (searchHistory.length > 8) {
		x = searchHistory.length - 8
	} else if (searchHistory.length === 0) {
		historyDiv.append(
			$(`<p style="font-size:small">`).text(`(No search history)`),
		)
	}
	// loop through searchHistory array and make list item for each
	for (let i = searchHistory.length - 1; i > x; i--) {
		let span = document.createElement(`span`)
		// if last item, don't append a dash
		span.innerHTML = `<button class="history-list-items">${
			searchHistory[i]
		}</button>${i > x + 1 ? "|" : ""}`
		historyDiv.append(span)
	}
}
const ServiceWorker = () => {
	let swController = navigator.serviceWorker.controller
	if ("serviceWorker" in navigator) {
		if (swController !== null && swController.state !== `activated`) {
			console.log(`Go ahead and register your service worker`)
			navigator.serviceWorker.register("./sw.js")
		} else {
			console.log(`Your SW is activated!`)
		}
	} else {
		console.log(`This browser does not support service worker API`)
	}
}
// function getGoogleImages() {
// 	console.log(currCit.name.length)
// 	// for(i=0;i<currCit.name.length;i++){

// 	// }
// }

init()

function init() {
	ServiceWorker()
	grabWeather(`monterey`) // initial city to display on load

	// refreshes the time displayed every second
	// the time is changed in function via the timezone set in "grab weather"
	setInterval(() => {
		document.querySelector(`#current-city-date`).textContent = `${getTime()}`
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
	// re-run search if any of "history" searches is clicked
	historyDiv.addEventListener(`click`, function (e) {
		if (e.target.nodeName === "BUTTON") {
			grabWeather(e.target.innerText)
		} else {
			console.log(`I'm sorry, that's not a list item`)
		}
	})
	// search form
	searchForm.addEventListener(`submit`, e => {
		e.preventDefault()

		// grab data from weather api
		grabWeather(searchInput.value.trim().toLowerCase())
	})

	// search history is locally stored
	// this retrieves any if found and displays it on the screen
	if (JSON.parse(localStorage.getItem(`WbGV-search-history`)) !== null) {
		searchHistory = JSON.parse(localStorage.getItem(`WbGV-search-history`))
		printHistory()
	}
}
