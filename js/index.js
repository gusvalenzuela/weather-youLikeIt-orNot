const searchForm = document.querySelector(`#search-form`);
const searchInput = document.querySelector(`#search-input`);
const searchButton = $(`#search-button`);
const currCitStats = $(`#current-city-stats`);
const historyDiv = $(`#history-div`);
const forecastDiv = $(`#forecast-div`);
const currCit = {};
const API_KEY = "4S11JlnMWVUPrva4271IE6m3AXotzHMJ";
const apk = "a49df28db557e1be1c568c4992f04aec";
var currentCity = {};
var cityImageURLs = [];
var searchHistory = [];
var forecast;
// Create a request variable and assign a new XMLHttpRequest object to it.
var request = new XMLHttpRequest();
var convertRequest = new XMLHttpRequest();

const grabWeather = async (cityname) => {
  try {
    // get locations from search term
    let Locations = await convertToCoords(cityname);
    // get weather from first of locations grabbed above
    let City = await pullsiez(Locations[0].latLng);
    // save name to our handy City obj
    City.name = `${Locations[0].adminArea5}, ${Locations[0].adminArea3}`;
    searchHistory.push(City.name); // save search term to history array
    searchHistory = [...new Set(searchHistory.reverse())].reverse(); // filtering out dupes, double reverse to keep most recent up top
    localStorage.setItem(`WbGV-search-history`, JSON.stringify(searchHistory)); // save history to local storage
    // render City data on screen
    render(City);
    printHistory();
  } catch (error) {
    throw error;
  }
};

var weatherErr = function weatherError() {
  // searchInput
  //   .attr(`style`, `border-style: groove; border-color: red;`)
  //   .attr(`placeholder`, `ENTER VALID CITY NAME`);
  // searchHistory.splice()      // want to delete the last item from array if returned with error
};

const convertToCoords = (searchterm) => {
  return new Promise((resolve) => {
    const URL = `https://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY}&location=${searchterm}`;
    convertRequest.open("GET", URL, true);
    convertRequest.send();
    convertRequest.onloadend = () => {
      let response = JSON.parse(convertRequest.response);
      resolve(response.results[0].locations);
    };
  });
};
const pullsiez = ({ lat, lng: lon }) => {
  return new Promise((resolve, rej) => {
    let URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&
    exclude=minutely,hourly&appid=${apk}&units=imperial`;
    request.open("GET", URL, true);
    request.send(); // Send request
    request.onloadend = function () {
      if (request.status >= 200 && request.status < 400) {
        resolve(JSON.parse(request.response)); // response saved in request instance on load ends
      } else {
        rej(`error`);
      }
    };
  });
};

const grabCityImage = (city) => {
  //   $.ajax({
  //     url:
  //       "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" +
  //       currCit.name +
  //       "&inputtype=textquery&fields=photos&key=" +
  //       ak,
  //     method: "GET",
  //   }).then(function (imgresponse) {
  //     console.log(currCit.name);
  //     console.log(imgresponse);
  //   });
};

const render = (city) => {
  // console.log(city);
  let d = document;
  // city date/time
  d.querySelector(`#current-city-date`).textContent = moment(
    city.current.dt
  ).format(`llll`);
  // city name
  d.querySelector(`#current-city-name`).textContent = city.name;
  // temp image/icon
  d.querySelector(`#temp-icon`).setAttribute(
    `src`,
    `http://openweathermap.org/img/wn/${city.current.weather[0].icon}@2x.png`
  );
  //temp
  d.querySelector(`#current-temp`).textContent = `${city.current.temp}°F`;
  // feels like
  d.querySelector(
    `#current-temp-feels`
  ).textContent = `Feels like: ${city.current.feels_like}°F`;
  // humidity
  d.querySelector(
    `#current-humidity`
  ).textContent = `${city.current.humidity}%`;
  // wind
  d.querySelector(
    `#current-windspeed`
  ).textContent = `${city.current.wind_speed}MPH`;
  // color coding uvi-index div
  if (city.current.uvi) {
    let uviElement = d.querySelector(`#current-uvindex`);
    uviElement.textContent = city.current.uvi; // setting the text content

    const uvi = Math.floor(city.current.uvi);
    // changing bg-color of parent element (div)
    if (uvi > 11) {
      uviElement.parentElement.className = `uvi-violet`;
    } else if (uvi >= 8) {
      uviElement.parentElement.className = `uvi-red`;
    } else if (uvi >= 6) {
      uviElement.parentElement.className = `uvi-orange`;
    } else if (uvi >= 3) {
      uviElement.parentElement.className = `uvi-yellow`;
    } else if (uvi >= 0) {
      uviElement.parentElement.className = `uvi-green`;
    }
  }
};

init();

function init() {
  if (JSON.parse(localStorage.getItem(`WbGV-search-history`)) !== null) {
    searchHistory = JSON.parse(localStorage.getItem(`WbGV-search-history`));
  }

  searchForm.addEventListener(`submit`, (e) => {
    e.preventDefault();
    // grab data from weather api
    grabWeather(searchInput.value.trim().toLowerCase());
    // console.log(searchHistory.includes(searchInput.value.trim()));
  });

  grabWeather(`sacramento`);
}

function printHistory() {
  // find how to make the list collapsible on sm screens (with classes)
  historyDiv.empty();

  var para = (document.createElement(
    `p`
  ).textContent = `Search History (click to search again):`);
  historyDiv.append(para);
  var x = 0;
  // if searchHistory has more than 7 entries only display the latest 7, otherwise display all.
  if (searchHistory.length > 8) {
    x = searchHistory.length - 8;
  } else if (searchHistory.length === 0) {
    historyDiv.append(
      $(`<p style="font-size:small">`).text(`(No search history)`)
    );
  }
  // loop through searchHistory array and make list item for each
  for (i = searchHistory.length - 1; i > x; i--) {
    let span = document.createElement(`span`);
    // if last item, don't append a dash
    span.innerHTML = `<button class="history-list-items">${
      searchHistory[i]
    }</button>${i > x + 1 ? " -" : ""}`;
    historyDiv.append(span);
  }
}

function printForecastData() {
  forecastDiv.empty();
  var iconImg, temp, humidity, date, div;
  for (k = 0; k < currCit.forecast.length; k++) {
    date = $(`<p class="text-center">`).text(
      moment()
        .add(1 + k, `days`)
        .format("l")
    );
    div = $(`<div>`).attr(`class`, `float-left text-left bg-ora m-2 p-3`);
    iconImg = $(`<img>`)
      .attr(`src`, currCit.forecast[k].icon_url)
      .attr(`class`, `mx-3 icon-image`);
    temp = $(`<p>`)
      .attr(`class`, `p-1 mb-1`)
      .html(
        `<span class="font-weight-bold">Temp</span>: ` +
          currCit.forecast[k].temp
      );
    humidity = $(`<p>`)
      .attr(`class`, `p-1 mb-1`)
      .html(
        `<span class="font-weight-bold">Humidity</span>: ` +
          currCit.forecast[k].humidity
      );
    div.append(date, iconImg, temp, humidity);
    forecastDiv.append(div);
  }
}
// function pullFiveDayForecast(){

// }
function getGoogleImages() {
  console.log(currCit.name.length);
  // for(i=0;i<currCit.name.length;i++){

  // }
}

// re-run search if any of "history" searches is clicked
let tempHisDiv = document.querySelector(`#history-div`);
tempHisDiv.addEventListener(`click`, function (e) {
  if (e.target.nodeName === "BUTTON") {
    grabWeather(e.target.innerText);
  } else {
    console.log(`I'm sorry, that's not a list item`);
  }
});
