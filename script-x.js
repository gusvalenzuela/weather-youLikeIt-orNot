
const searchForm = $(`#search-form`)
const searchInput = $(`#search-input`)
const searchButton = $(`#search-button`)
const currentCityStats = $(`#current-city-stats`)
const historyDiv = $(`#history-div`)
var cityImageURLs = []
var searchHistory = []
var searchTerm;
var currentCity;

var weatherErr = function weatherError(){
    searchInput.attr(`style`, `border-style: groove; border-color: red;`).attr(`placeholder`,`ENTER VALID CITY NAME`)
}

init()

function init(){
    searchTerm = `sacramento`
    currentCity = {}
    pullWeatherData()
    printHistory()
}
function printHistory(){
    historyDiv.empty()
    searchHistory = JSON.parse(localStorage.getItem(`weather-app-search-history`))
    var x = 0
    if(searchHistory.length > 10){
        x = searchHistory.length - 10
    } 
        for(i=searchHistory.length-1;i>x;i--){
        
        var ul = $(`<ul class="pl-2 w-100" id="history-list">`)
        var lItem = $(`<li>`).text(searchHistory[i]).appendTo(ul)
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
    var apiKey = `a49df28db557e1be1c568c4992f04aec`
    
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q="+searchTerm+"&appid="+apiKey+"&units=imperial",
        method: "GET",
        error: weatherErr
    }).then(function(response){
        console.log(`===== WEATHER RESPONSE (RECEIVED) START =====`)
        searchInput.attr(`style`, ``)
        console.log(response)

        currentCity.name = response.name
        currentCity.temp = response.main.temp + " F°"
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
            url: "https://api.openweathermap.org/data/2.5/uvi?lat="+currentCity.coord.lat+"&lon="+currentCity.coord.lon+"&appid="+apiKey,
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
    
    console.log(currentCity)
}
function printWeatherData(){
    
    currentCityStats.empty()
    var iconImg = $(`<img>`).attr(`src`, currentCity.icon_url).attr(`class`,`mx-3 icon-image`)
    var dateDisplay = $(`<p class="mb-0 text-center" style="font-size: small;">`).text(moment().utcOffset(currentCity.timezoneGMT).format(`llll`))
    var headerName = $(`<h2>`).attr(`class`,`text-left city-name`).text(currentCity.name).append(iconImg)
    var ul = $(`<ul>`).attr(`class`,`w-100 list-group text-left`)
    var currentTemp = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-temp`).html(`<span class="font-weight-bold">Temp</span>: `+currentCity.temp)
    var currentHumidity = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-humi`).html(`<span class="font-weight-bold">Humidity</span>: `+currentCity.humidity)
    var currentUVIndex = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-uvin`).html(`<span class="font-weight-bold">UV Index</span>: `+currentCity.uvIndex)
    var currentWindspeed = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-wind`).html(`<span class="font-weight-bold">Wind Speed</span>: `+currentCity.windSpeed)
   
    switch(Math.floor(currentCity.uvIndex)){
        case 0:
        case 1:
        case 2:
            currentUVIndex.attr(`class`, `p-1 list-group-item rounded-0 bg-suc`)
            break
        case 3:
        case 4:
        case 5:
            currentUVIndex.attr(`class`, `p-1 list-group-item rounded-0 bg-war`)
            break
        case 6:
        case 7:
            currentUVIndex.attr(`class`,`p-1 list-group-item rounded-0 bg-ora`)
            break
        case 8:
        case 9:
        case 10:
            currentUVIndex.attr(`class`,`p-1 list-group-item rounded-0 bg-dan`)
            break
        default:
            currentUVIndex.attr(`class`,`p-1 list-group-item rounded-0 bg-vio`)
            break
    }

    // append all list s into my UL and finally append that to the prerendered div currentCityStats
    ul.append(headerName, dateDisplay, currentTemp,currentHumidity,currentWindspeed, currentUVIndex)
    currentCityStats.append(ul)
}
function getGoogleImages(){
    console.log(currentCity.name.length)
    // for(i=0;i<currentCity.name.length;i++){

    // }
    
    

}

console.log(currentCity)