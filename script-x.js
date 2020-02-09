
const searchForm = $(`#search-form`)
const searchInput = $(`#search-input`)
const searchButton = $(`#search-button`)
var currentCity = {}

searchForm.submit(function(event){
    event.preventDefault()
    currentCity.name = searchInput[0].value.trim()
    pullWeatherData()
    printWeatherData()
})

function pullWeatherData(){
    var apiKey = `a49df28db557e1be1c568c4992f04aec`
    
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q="+currentCity.name+"&appid="+apiKey+"&units=imperial",
        method: "GET",
    }).then(function(response){
        console.log(`===== CURRENT CITY RESPONSE (RECEIVED) START =====`)
        console.log(response)

        currentCity.temp = response.main.temp + " F°"
        currentCity.humidity = response.main.humidity + " %"
        currentCity.windSpeed = response.wind.speed + " MPH"
        currentCity.coord = response.coord
        currentCity.icon_url = `http://openweathermap.org/img/wn/`+response.weather[0].icon+`@2x.png`
        // console.log(`local time in ` + currentCity.name + ` is ` + moment().format(`LLLL`))
        
        console.log(`===== CURRENT CITY RESPONSE END =====`)
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/uvi?appid=`+apiKey+`&lat=`+currentCity.coord.lat+`&lon=`+currentCity.coord.lon,
            method: `GET`,
        }).then(function(res){
            console.log(res)
            currentCity.uvIndex = res.value
            console.log(currentCity.uvIndex)
        })
    })
}

function printWeatherData(){
    console.log(`=====PRINTING...=====`)
}

