
const searchForm = $(`#search-form`)
const searchInput = $(`#search-input`)
const searchButton = $(`#search-button`)
const currentCityStats = $(`#current-city-stats`)
var cityImageURLs = []
var searchTerm;
var currentCity = {}

searchForm.submit(function(event){
    event.preventDefault()
    searchTerm = searchInput[0].value.trim()
    pullWeatherData()
    getGoogleImages()
    
})

function pullWeatherData(){
    var apiKey = `a49df28db557e1be1c568c4992f04aec`
    
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q="+searchTerm+"&appid="+apiKey+"&units=imperial",
        method: "GET",
    }).then(function(response){
        console.log(`===== WEATHER RESPONSE (RECEIVED) START =====`)
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
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/uvi?appid=`+apiKey+`&lat=`+currentCity.coord.lat+`&lon=`+currentCity.coord.lon,
            method: `GET`,
        }).then(function(res){
            currentCity.uvIndex = res.value
            console.log(currentCity.uvIndex)
            printWeatherData()
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
    var headerName = $(`<h2>`).attr(`class`,`text-center`).text(currentCity.name)
    var ul = $(`<ul>`).attr(`class`,`list-group text-left`)
    var currentTemp = $(`<li>`).attr(`class`,`list-group-item bg-transparent`).attr(`id`,`city-temp`).text(`Temp: `+currentCity.temp)
    var currentHumidity = $(`<li>`).attr(`class`,`list-group-item bg-transparent`).attr(`id`,`city-humi`).text(`Humidity: `+currentCity.humidity)
    var currentUVIndex = $(`<li>`).attr(`class`,`list-group-item bg-transparent`).attr(`id`,`city-uvin`).text(`UV Index: `+currentCity.uvIndex)
    var currentWindspeed = $(`<li>`).attr(`class`,`list-group-item bg-transparent`).attr(`id`,`city-wind`).text(`Wind Speed: `+currentCity.windSpeed)
    
    if(currentCity.uvIndex > 7){
        currentUVIndex.attr(`class`, `list-group-item bg-danger`)
    }else if(currentCity.uvIndex > 3){
        currentUVIndex.attr(`class`,`list-group-item bg-warning`)
    } else{
        currentUVIndex.attr(`class`,`list-group-item bg-success`)
    }

    ul.append(headerName, currentTemp,currentHumidity,currentWindspeed, currentUVIndex)
    currentCityStats.append(ul)
}
function getGoogleImages(){
    console.log(currentCity.name.length)
    // for(i=0;i<currentCity.name.length;i++){

    // }
    
    $.ajax({
        // url:"https://serpapi.com/search?q=Apple&tbm=isch&ijn=0",
        method: "GET"
    }).then(function(imgresponse){
        console.log(`===== Google Images Response Received ======`)
        console.log(imgresponse)
    })

}

console.log(currentCity)