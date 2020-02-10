
const searchForm = $(`#search-form`)
const searchInput = $(`#search-input`)
const searchButton = $(`#search-button`)
const currentCityStats = $(`#current-city-stats`)
var cityImageURLs = []
var searchHistory = []
var searchTerm;
var currentCity;
// searchHistory = localStorage.getItem(JSON.parse(`weather-app-search-history`))

init()

function init(){
    searchTerm = `sacramento`
    currentCity = {}
    pullWeatherData()
}

searchForm.submit(function(event){
    event.preventDefault()
    currentCity = {}
    searchTerm = searchInput[0].value.trim()
    pullWeatherData()
    searchHistory.push(searchTerm)
    localStorage.setItem(`weather-app-search-history`,JSON.stringify(searchHistory))
})
var weatherErr = function weatherError(){
    searchInput.attr(`style`, `border-style: groove; border-color: red;`).attr(`placeholder`,`ENTER VALID CITY NAME`)

}

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
        currentCity.timezoneGMT = Math.floor(((response.timezone)/60)/60)
        console.log(currentCity.timezoneGMT)
        // console.log(`local time in ` + currentCity.name + ` is ` + moment.tz().format(`LLLL`))
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
    console.log(currentCity)
    console.log(`=====PRINTING...=====`)
    console.log(currentCity.uvIndex)
    var iconImg = $(`<img>`).attr(`src`, currentCity.icon_url).attr(`height`,`75px;`).attr(`class`,`mx-3 icon-image`)
    var headerName = $(`<h2>`).attr(`class`,`text-left city-name`).text(currentCity.name).append(iconImg)
    var ul = $(`<ul>`).attr(`class`,`w-100 list-group text-left`)
    var currentTemp = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-temp`).html(`<i class="font-weight-bold">Temp</i>: `+currentCity.temp)
    var currentHumidity = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-humi`).html(`<i class="font-weight-bold">Humidity</i>: `+currentCity.humidity)
    var currentUVIndex = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-uvin`).html(`<i class="font-weight-bold">UV Index</i>: `+currentCity.uvIndex)
    var currentWindspeed = $(`<li>`).attr(`class`,`p-1 list-group-item rounded-0 bg-transparent`).attr(`id`,`city-wind`).html(`<i class="font-weight-bold">Wind Speed</i>: `+currentCity.windSpeed)
    
    switch(Math.floor(currentCity.uvIndex)){
        case 0:
        case 1:
        case 2:
            currentUVIndex.attr(`class`, `p-1 list-group-item rounded-0 bg-suc text-body`)
            break
        case 3:
        case 4:
        case 5:
            currentUVIndex.attr(`class`, `p-1 list-group-item rounded-0 bg-war text-body`)
            break
        case 6:
        case 7:
            currentUVIndex.attr(`class`,`p-1 list-group-item rounded-0 bg-ora text-body`)
            break
        case 8:
        case 9:
        case 10:
            currentUVIndex.attr(`class`,`p-1 list-group-item rounded-0 bg-dan text-body`)
            break
        default:
            currentUVIndex.attr(`class`,`p-1 list-group-item rounded-0 bg-vio text-body`)
            break
    }

    // append all list items into my UL and finally append that to the prerendered div currentCityStats
    ul.append(headerName, currentTemp,currentHumidity,currentWindspeed, currentUVIndex)
    currentCityStats.append(ul)
}
function getGoogleImages(){
    console.log(currentCity.name.length)
    // for(i=0;i<currentCity.name.length;i++){

    // }
    
    

}

console.log(currentCity)