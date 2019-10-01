class App {
  constructor() {
    this.apiList = {};
    this.userPositionLat = null;
    this.userPositionLong = null;
    this.domElements = {
      tabSelected: null,
      containerSelected: null,
    };
    this.deleteWaypoint = this.deleteWaypoint.bind(this);
    this.addLocationClickHandler = this.addLocationClickHandler.bind(this);
    this.retrieveUserPositon = this.retrieveUserPositon.bind(this);
    this.initApp = this.initApp.bind(this);
    this.domClickHandler = this.domClickHandler.bind(this);
    this.expandAndCollapse = this.expandAndCollapse.bind(this);
    this.tabClickHandler = this.tabClickHandler.bind(this);
  }

  /**
  * Gets position of user at app start
  * @param - none
  * @return - none
  */

  initApp() {
    navigator.geolocation.getCurrentPosition(this.retrieveUserPositon);
  }

  /**
  * Updates location from user entry, updates DOM and map
  * @param - none
  * @return - none
  */

  updateLocation() {
    this.apiList.map.clearMarkers();
    $('.eventsContainer').empty();
    $('.businessContainer').empty();
    $('.weatherContainer').empty();
    $('.destinationsAdded').empty();
    $('.directionsPanel').empty();
    $('.calculateRoute').removeClass('hidden');
    var userMarker = new Marker(this.apiList.map.mapObj, { name: "You" }, undefined, this.apiList.map.updateLocation, this.apiList.map.closeWindows, this.apiList.map.expandClickHandler);
    userMarker.renderUser({
      lat: this.userPositionLat,
      lng: this.userPositionLong
    });
    this.apiList.map.markers.user = userMarker;
    this.initAJAX();
  }

  /**
  * Sets lat and lng, calls init methods
  * @param {object} - object returned from initApp()
  * @return - none
  */

  retrieveUserPositon(data) {
    this.userPositionLat = data.coords.latitude;
    this.userPositionLong = data.coords.longitude;
    this.initializeMap();
    this.initAJAX();
    this.initClickHandlers();
  }

  /**
  * Instantiates map
  * @param - none
  * @return - none
  */

  initializeMap() {
    this.apiList.map = new googleMap(this.userPositionLat, this.userPositionLong, this.expandAndCollapse);
    this.apiList.map.initMap();
  }

  /**
  * Instantiates API classes, calls retrieveData methods for each class, updates DOM
  * @param - none
  * @return - none
  */

  initAJAX() {
    this.apiList.eventbrite = new Eventbrite(this.userPositionLat, this.userPositionLong, this.addLocationClickHandler);
    this.apiList.yelp = new Yelp(this.userPositionLat, this.userPositionLong, this.addLocationClickHandler);
    this.apiList.weather = new WeatherData(this.userPositionLat, this.userPositionLong);

    this.apiList.weather.getWeatherData();

    this.apiList.eventbrite.retrieveData().then(data => this.apiList.map.addEvents(data.events))
      .catch(data => console.log(data));

    this.apiList.yelp.retrieveData().then(data => {
      this.apiList.map.addBiz(data.businesses);
      this.loadScreenHandler();
    })
      .catch(data => console.log(data));
  }

  /**
  * creates click handlers for DOM elements
  * @param - none
  * @return - none
  */

  initClickHandlers() {
    this.domElements.tabSelected = $('.tabBars');
    this.domElements.containerSelected = $('.businessContainer');
    $('.eventsContainer').on('click', '.event', this.domClickHandler);
    $('.businessContainer').on('click', '.business', this.domClickHandler);
    $('.mapContainer').on('click', '.addLocation', this.addLocationClickHandler);
    $('.calculateRoute').on('click', this.apiList.map.calculateAndDisplayRoute);
    $('.tabContainer').on('click', '.tab', this.tabClickHandler);
  }

  /**
  * click handler for loading screen
  * @param - none
  * @return - none
  */

  loadScreenHandler() {
    $('.loading_icon').toggleClass('hidden');
    var loadScreenDom = $(".loading_screen");
    loadScreenDom.addClass('slide_to_top');
  }

  /**
  * click handler for DOM elements
  * @param {object} - event
  * @return - none
  */
  domClickHandler(event) {
    if ($(event.target).is("a")) {
      return;
    }
    this.expandAndCollapse($(event.currentTarget));
  }

  tabClickHandler(event) {
    var element = $(event.currentTarget);
    this.domElements.tabSelected.removeClass('tabSelected');
    element.addClass('tabSelected');
    this.domElements.tabSelected = element;
    var container = $('.' + element.text().toLowerCase());
    this.domElements.containerSelected.addClass('hidden');
    container.removeClass('hidden');
    this.domElements.containerSelected = container;
  }

  /**
  * expands/contracts DOM elements in the side bar
  * @param {object} - jQuery object
  * @return - none
  */

  expandAndCollapse(element) {
    var lastLetter = element.attr('id').match(/\d+/);
    if (element.hasClass('business')) {
      this.tabClickHandler({ currentTarget: $('.tabBars') });
      this.apiList.map.updateLocation({
        lat: parseFloat(this.apiList.yelp.getCoordinatesById('lat', lastLetter)),
        lng: parseFloat(this.apiList.yelp.getCoordinatesById('lng', lastLetter))
      });
      if (element.hasClass("expanded")) {
        $(".business").removeClass("collapsed");
        $(".business").removeClass("expanded");
      }
      else {
        $(".business").removeClass("expanded");
        $(".business").addClass("collapsed")
        element.removeClass("collapsed").addClass("expanded");
      }
    } else {
      this.tabClickHandler({ currentTarget: $('.tabEvents') });
      this.apiList.map.updateLocation({
        lat: parseFloat(this.apiList.eventbrite.getCoordinatesById('lat', lastLetter)),
        lng: parseFloat(this.apiList.eventbrite.getCoordinatesById('lng', lastLetter))
      });
      if (element.hasClass("expanded")) {
        $(".event").removeClass("collapsed");
        $(".event").removeClass("expanded");
      }
      else {
        $(".event").removeClass("expanded");
        $(".event").addClass("collapsed")
        element.removeClass("collapsed").addClass("expanded");
      }
    }
  }

  /**
  * click handler for adding markers to the route
  * @param {object} - event object
  * @return - none
  */

  addLocationClickHandler(event) {
    var target = $(event.currentTarget);
    var clickId = target.attr('id');
    var newDom = null;
    if (clickId.includes("business")) {
      newDom = $('.business.' + clickId).clone().off();
      clickId = clickId.substr(8);
      $(`#business${clickId}.route`).removeClass("addLocation").text("Added to route");
      newDom.children().not(".businessName").remove();
      newDom.addClass('destination');
    } else {
      newDom = $('.event.' + clickId).clone().off();
      clickId = clickId.substr(5);
      $(`#event${clickId}.route`).removeClass("addLocation").text("Added to route");
      newDom.children().not(".event-name").remove();
      newDom.addClass('destination');
    }
    newDom.append($("<button>").addClass("delete_button").text("delete").click(this.deleteWaypoint));
    $('.destinationsAdded').append(newDom).sortable({
      containment: "parent"
    });
  }

  deleteWaypoint(event) {
    let waypointDom = $(event.currentTarget).parent();
    let wayptRouteIndex = waypointDom.index();
    let eventBizIndex = parseInt(waypointDom.attr("class").match(/\d+/));
    let type = waypointDom.attr("class").split(" ")[0];
    this.apiList.map.resetMarkerInfo(type, eventBizIndex);
    $(`#${type}${eventBizIndex}.route`).toggleClass('addLocation').text('Add Location To Route');
    waypointDom.remove();
    this.apiList.map.deleteWaypoint(wayptRouteIndex);
  }
}
