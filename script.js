var APIKey = "b73d88dace0b7f8d38c2b9f955bb51d9";

var city = "";
/*
http://api.openweathermap.org/geo/1.0/direct?q=oklahom ciyt,OK,US&limit=10&appid=b73d88dace0b7f8d38c2b9f955bb51d9

https://api.openweathermap.org/data/2.5/onecall?lat=35.4729886&lon=-97.5170536&appid=b73d88dace0b7f8d38c2b9f955bb51d9
*/
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var sCity = [];
function find(c) {
  for (var i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}


function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
  }
}
const GC_URL_1 = "http://api.openweathermap.org/geo/1.0/direct?q="; //q=City, ST, US
function currentWeather(city) {

  let url1 = GC_URL_1 + city + "&APPID=" + APIKey;
  $.ajax({
    url: url1,
    method: "GET",
  }).then(function (resp1) {
    const lat = resp1[0].lat;
    const lon = resp1[0].lon;
    var queryURL =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&APPID=" +
      APIKey;
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      console.log(response);
      var weathericon = response.current.weather[0].icon;
      var iconurl =
        "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

      var date = new Date(response.dt * 1000).toLocaleDateString();

      $(currentCity).html(
        response.name + "(" + date + ")" + "<img src=" + iconurl + ">"
      );

      var tempF = (response.current.temp - 273.15) * 1.8 + 32;
      $(currentTemperature).html(tempF.toFixed(2) + "&#8457");

      $(currentHumidty).html(response.current.humidity + "%");

      var ws = response.current.wind_speed;
      var windsmph = (ws * 2.237).toFixed(1);
      $(currentWSpeed).html(windsmph + "MPH");

      UVIndex(response.lon, response.lat);
      forecast(response.lon, response.lat);
      if (response.cod == 200) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        console.log(sCity);
        if (sCity == null) {
          sCity = [];
          sCity.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(sCity));
          addToList(city);
        } else {
          if (find(city) > 0) {
            sCity.push(city.toUpperCase());
            localStorage.setItem("cityname", JSON.stringify(sCity));
            addToList(city);
          }
        }
      }
    });
  });
}

function UVIndex(ln, lt) {
  var uvqURL =
    "https://api.openweathermap.org/data/2.5/onecall?APIKey=" +
    APIKey +
    "&lat=" +
    lt +
    "&lon=" +
    ln;
  $.ajax({
    url: uvqURL,
    method: "GET",
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}

function forecast(ln, lt) {
  var dayover = false;
  var queryforcastURL =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lt +
    "&lon=" +
    ln +
    "&APIKey=" +
    APIKey;
  console.log("forecast:", queryforcastURL);
  $.ajax({
    url: queryforcastURL,
    method: "GET",
  }).then(function (response) {
    console.log("forecast resp", response);
    for (i = 0; i < 5; i++) {
      const daily = response.daily[i];
      console.log("DAILY:", daily);
      //  response.list[(i + 1) * 8 - 1].dt * 1000
      var date = new Date(daily.dt * 1000).toLocaleDateString();

      var iconcode = daily.weather[0].icon;
      var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      var tempK = daily.temp.day;
      var tempF = ((tempK - 273.5) * 1.8 + 32).toFixed(2);
      var humidity = daily.humidity;
      console.log(i, "Temp: ", tempF, "Humidity:", humidity);
      $("#Date" + i).html(date);
      $("#Img" + i).html("<img src=" + iconurl + ">");
      $("#Temp" + i).html(tempF + "&#8457");
      $("#Humidity" + i).html(humidity + "%");
    }
  });
}

function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}

function invokePastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

function loadlastCity() {
  $("ul").empty();
  var sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    sCity = JSON.parse(localStorage.getItem("cityname"));
    for (i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i - 1];
    currentWeather(city);
  }
}

function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}

$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);
