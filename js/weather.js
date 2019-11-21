/**
 * Class WeatherData takes in user's latitude and longitude coordinates
 * @param {number} latitude coordinate
 * @param {number} longitude coordinate
 * @param {object} javascript date object
 *
 */
class WeatherData {
  constructor(lat, lng, date) {
    this.key = darkSkyApi;
    this.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.coord = { lat, lng };
    this.date = date;
    this.currentDate = null;
    this.currentTemp = null;
    this.currentCondition = null;
    this.currentIcon = null;
    this.forcast = [];
    this.domElements = {
      container: $(".weatherContainer"),
      current: null,
      day1: null,
      day2: null,
      day3: null,
      day4: null,
      day5: null
    }
    this.getWeatherDataSuccess = this.getWeatherDataSuccess.bind(this);
  }
  /**
  *  Creates dom elements and appends them to the weatherContainer dom element
  *  @param {none}
  *  @return {none}
  */
  render() {
    for (var forcastIndex = 0; forcastIndex < this.forcast.length; forcastIndex++) {
      var forcastWeatherContainer = $("<div>", { class: `forcast${forcastIndex}WeatherContainer` })//.css("background-image", `url("assets/images/weather/${this.forcast[forcastIndex].icon}.png")`);
      var forcastWeatherHeader = $("<div>", { class: `forcast${forcastIndex} weatherHeader`, text: this.days[this.forcast[forcastIndex].date.getDay()] });
      var forcastWeatherIcon = $("<div>", { class: `forcast${forcastIndex}WeatherIcon weatherIcon` }).css("background-image", `url("assets/images/weather/${this.forcast[forcastIndex].icon}.png")`);
      var forcastHighLow = $("<div>", { class: `forcast${forcastIndex} WeatherHeader weather_box_text`, html: `${this.forcast[forcastIndex].high}/${this.forcast[forcastIndex].low}&#176;F`});
      forcastWeatherContainer.append(forcastWeatherHeader, forcastWeatherIcon, forcastHighLow);
      this.domElements["forcast" + forcastIndex] = forcastWeatherContainer;
      this.domElements.container.append(forcastWeatherContainer);
    }
  }
  /**
   * Calls the ajax function for the weather api dark sky
   * @param {none}
   * @return {none}
  */
  getWeatherData() {
    var ajaxConfigObject = {
      dataType: "json",
      url: "https://api.darksky.net/forecast/" + this.key + "/" + this.coord.lat + "," + this.coord.lng,
      method: "get",
      data: {

        exclude: "minutely"
      }
    }
    $.ajax(ajaxConfigObject).done(this.getWeatherDataSuccess).fail(this.getWeatherDataError).always(this.getWeatherDataAlways);
  }
  /**
   * Callback function for dark sky api
   * processes data and saves relevant info into this object
   * calls this.render
   * @param {object} data - dark sky json data
   * @return {none}
   */
  getWeatherDataSuccess(data) {
    this.currentDate = this.createNewDate(data.currently.time);
    this.currentTemp = parseInt(data.currently.temperature);
    this.currentCondition = data.currently.summary;
    this.currentIcon = data.currently.icon;
    var eachDaysWeather = data.daily.data;
    for (var dayIndex = 0; dayIndex < eachDaysWeather.length - 1; dayIndex++) {
      var forcastDay = {};
      forcastDay.date = this.createNewDate(eachDaysWeather[dayIndex].time);
      forcastDay.high = parseInt(eachDaysWeather[dayIndex].temperatureHigh);
      forcastDay.low = parseInt(eachDaysWeather[dayIndex].temperatureLow);
      forcastDay.icon = eachDaysWeather[dayIndex].icon;
      forcastDay.summary = eachDaysWeather[dayIndex].summary;
      this.forcast.push(forcastDay);
    }
    this.render();
  }
  /**
   * ajax error callback function
   * @param {none}
   * @return {none}
   */
  getWeatherDataError() {
    console.log("There was an error getting weather data");
  }
  /**
   * ajax complete callback function
   * @param {none}
   * @return {none}
   */
  getWeatherDataAlways() {
    console.log("Get weather data complete");
  }
  /**
   * sets new coordinates and calls getWeatherData
   * @param {number} lat
   * @param {number} lng
   * @return {none}
   */
  getNewWeather(lat, lng){
    this.coord = { lat, lng };
    this.getWeatherData();
  }
  /**
   * creates a new javascript Date object with linux time
   * @param {number} linuxTime
   * @return {object} javascript Date object
   */
  createNewDate(linuxTime) {
    return new Date(linuxTime * 1000);
  }
}
