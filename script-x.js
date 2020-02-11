const searchForm = $(`#search-form`)
const searchInput = $(`#search-input`)
const searchButton = $(`#search-button`)
const currentCityStats = $(`#current-city-stats`)
const historyDiv = $(`#history-div`)
const forecastDiv = $(`#forecast-div`)
var cityImageURLs = []
var searchHistory = []
var apk, currentCity, forecast;

if(JSON.parse(localStorage.getItem(`weather-app-search-history`)) !== null){
    searchHistory = JSON.parse(localStorage.getItem(`weather-app-search-history`))
}


var weatherErr = function weatherError(){
    searchInput.attr(`style`, `border-style: groove; border-color: red;`).attr(`placeholder`,`ENTER VALID CITY NAME`)
    // searchHistory.splice()      // want to delete the last item from array if returned with error
}

init()

function init(){
    // may want to pull local GPS data provided by browser in future release
    searchTerm = `sacramento`
    currentCity = {}
    pullWeatherData()
    printHistory()
}
function printHistory(){        // find how to make the list collapsible on sm screens (with classes)
    historyDiv.empty()
    var para = $(`<p class="lead">`).text(`Search History:`)
    historyDiv.append(para)
    var x = 0
    // if searchHistory has more than 10 entries only display the latest 10, otherwise display all.
    if (searchHistory.length > 10) {
        x = searchHistory.length - 10
    } else if (searchHistory.length === 0) {
        historyDiv.append($(`<p style="font-size:small">`).text(`(No search history)`))
    }
    // loop through searchHistory array and make list item for each
    var ul = $(`<ul class="pl-1 text-left" id="history-list">`)
    for (i = searchHistory.length - 1; i > x; i--) {
        $(`<li class="history-list-items p-1 nav-item text-truncate">`).attr(`data-isListItem`,`y`).text(searchHistory[i]).appendTo(ul)
        historyDiv.append(ul)
    }
}
searchForm.submit(function(event){
    event.preventDefault()
    currentCity = {}
    searchTerm = searchInput[0].value.trim()
    pullWeatherData()
    searchHistory.push(searchTerm)
    localStorage.setItem(`weather-app-search-history`,JSON.stringify(searchHistory))
    printHistory()
})
function pullWeatherData(){
    apk = `a49df28db557e1be1c568c4992f04aec`

    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q="+searchTerm+"&appid="+apk+"&units=imperial",
        method: "GET",
        error: weatherErr
    }).then(function(response){
        console.log(`===== WEATHER RESPONSE (RECEIVED) START =====`)
        searchInput.attr(`style`, ``)
        console.log(response)

        currentCity.name = response.name
        currentCity.temp = response.main.temp + "° F"
        currentCity.humidity = response.main.humidity + " %"
        currentCity.windSpeed = response.wind.speed + " MPH"
        currentCity.coord = response.coord
        currentCity.icon_url = `http://openweathermap.org/img/wn/`+response.weather[0].icon+`@2x.png`
        currentCity.timezoneGMT = Math.floor(((response.timezone)/60))
        console.log(currentCity.timezoneGMT)
        // console.log(`local time in ` + currentCity.name + ` is ` + moment().utcOffset(currentCity.timezoneGMT).format(`ll`))
    }).then(function(){
        var ak = `AIzaSyAYlOOGrSdKUf7eEO-W37dOfQJBAbImqvY`
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/uvi?lat="+currentCity.coord.lat+"&lon="+currentCity.coord.lon+"&appid="+apk,
            method: "GET",
            error: printWeatherData(),
        }).then(function(res){
            console.log(res)
            currentCity.uvIndex = res.value
            console.log(currentCity.uvIndex)
            printWeatherData()
        })
        $.ajax({
            url:"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input="+currentCity.name+"&inputtype=textquery&fields=photos&key="+ak,
            method: "GET"
        }).then(function(imgresponse){
            console.log(currentCity.name)
            console.log(`===== Google Images Response Rece&ived ======`)
            console.log(imgresponse)
        })

        console.log(`===== WEATHER RESPONSE END =====`)
    })

    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?q="+searchTerm+"&appid="+apk+"&units=imperial",
        method: "GET",
        error: weatherErr
    }).then(function(fresponse){
        console.log(`===== FORECAST RESPONSE (RECEIVED) START =====`)
        searchInput.attr(`style`, ``)
        console.log(fresponse)
        currentCity.forecast = []
        
        var g = 0
        for(f=7;f<fresponse.list.length;f+=7){
            currentCity.forecast[g] = {}

            currentCity.forecast[g].temp = fresponse.list[f].main.temp + " F°"
            currentCity.forecast[g].date = fresponse.list[f].dt
            currentCity.forecast[g].humidity = fresponse.list[f].main.humidity + " %"
            currentCity.forecast[g].icon_url = `http://openweathermap.org/img/wn/`+fresponse.list[f].weather[0].icon+`@2x.png`
            g++
        }

        // currentCity.name = response.name
        // forecast.temp = response.main.temp + " F°"
        // currentCity.humidity = response.main.humidity + " %"
        // currentCity.windSpeed = response.wind.speed + " MPH"
        // currentCity.coord = response.coord
        // currentCity.icon_url = `http://openweathermap.org/img/wn/`+response.weather[0].icon+`@2x.png`
        // currentCity.timezoneGMT = Math.floor(((response.timezone)/60))
        // console.log(currentCity.timezoneGMT)
        // console.log(`local time in ` + currentCity.name + ` is ` + moment().utcOffset(currentCity.timezoneGMT).format(`ll`))
    }).then(printForecastData)

}
function printWeatherData(){
    
    currentCityStats.empty()
    var iconImg = $(`<img>`).attr(`src`, currentCity.icon_url).attr(`class`,`mx-3 icon-image`)
    var dateDisplay = $(`<p class="mb-0 text-center" style="font-size: small;">`).text(moment().utcOffset(currentCity.timezoneGMT).format(`ll`))
    var headerName = $(`<h2>`).attr(`class`,`text-center city-name`).text(currentCity.name)
    var ul = $(`<ul>`).attr(`class`,`w-100 list-group text-left`)
    var currentTemp = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-temp`).html(`<span class="current-temp-display">`+currentCity.temp+`</span>`).prepend(iconImg)
    var bottomStatsDiv = $(`<div class="row m-1 p-2 text-center">`)
    var currentHumidity = $(`<div>`).attr(`class`,`col-4 p-1 bg-transparent`).attr(`id`,`city-humi`).html(`<span class="bottom-stats-headerName">Humidity: </span><br>`+currentCity.humidity)
    var currentUVIndex = $(`<div>`).attr(`class`,`col-4 p-1 bg-transparent`).attr(`id`,`city-uvin`).html(`<span class="bottom-stats-headerName">UV Index: </span><br>`+currentCity.uvIndex)
    var currentWindspeed = $(`<div>`).attr(`class`,`col-4 p-1 bg-transparent`).attr(`id`,`city-wind`).html(`<span class="bottom-stats-headerName">Wind Speed</span><br>`+currentCity.windSpeed)
   
    var uvin = Math.floor(currentCity.uvIndex)
    if(uvin > 11){
        currentUVIndex.attr(`class`,`col-4 p-1 list-group-item rounded-0 bg-vio`)
    } else if (uvin >= 8){
        currentUVIndex.attr(`class`,`col-4 p-1 list-group-item rounded-0 bg-dan`)
    } else if (uvin >= 6){
        currentUVIndex.attr(`class`,`col-4 p-1 list-group-item rounded-0 bg-ora`)
    } else if (uvin >= 3){
        currentUVIndex.attr(`class`, `col-4 p-1 list-group-item rounded-0 bg-war`)
    } else if (uvin >= 0){
        currentUVIndex.attr(`class`, `col-4 p-1 list-group-item rounded-0 bg-suc`)
    } 

    // append all list s into my UL and finally append that to the prerendered div currentCityStats
    bottomStatsDiv.append(currentHumidity, currentWindspeed, currentUVIndex)
    ul.append(dateDisplay, headerName, currentTemp, bottomStatsDiv)
    currentCityStats.append(ul)
}
function printForecastData(){
    forecastDiv.empty()
    var iconImg, temp, humidity, date, div;
    for(k=0;k<currentCity.forecast.length;k++){
        date = moment().add(1+k,`days`).format('l')
        div = $(`<div>`).attr(`class`,`float-left text-left bg-ora m-2 p-3`)
        iconImg = $(`<img>`).attr(`src`, currentCity.forecast[k].icon_url).attr(`class`,`mx-3 icon-image`)
        temp = $(`<p>`).attr(`class`,`p-1`).html(`<span class="font-weight-bold">Temp</span>: `+currentCity.forecast[k].temp)
        humidity = $(`<p>`).attr(`class`,`p-1`).html(`<span class="font-weight-bold">humidity</span>: `+currentCity.forecast[k].humidity)
        div.append(date,iconImg,temp,humidity)
        forecastDiv.append(div)
    }
}
// function pullFiveDayForecast(){
    
// }
function getGoogleImages(){
    console.log(currentCity.name.length)
    // for(i=0;i<currentCity.name.length;i++){

    // }
}

// re-run search if any of "history" searches is clicked
historyDiv.on(`click`,function(e){
    var el = e.target
    if(el.attributes[`data-isListItem`].value === `y`){
        searchTerm = el.innerText
        pullWeatherData()
    } else{
        console.log(`I'm sorry, that's not a list item`)
    }
})
console.log(`======= END OF SCRIPT =======`)
console.log(currentCity)