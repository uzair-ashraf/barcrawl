class Marker {
  constructor(map, data, domElement, updateCenterCallback, closeWindows, markerExpandClickHandler) {
    this.eventClickHandler = this.eventClickHandler.bind(this)
    this.closeWindows = closeWindows;
    this.updateCenterCallback = updateCenterCallback;
    this.domElement = $(domElement);
    this.data = data;
    this.map = map;
    this.type = null;
    this.marker = null;
    this.name = null;
    this.infoWindow = null;
    this.position = null;
    this.markerExpandClickHandler = markerExpandClickHandler;
  }
  /**
   creates and renders the user's marker on the Map
   * @param {object} position: object containing lat and lng key/value pairs
   * @return {none}
  */
  renderUser(position) {
    const userMark = new google.maps.Marker({
      position: position,
      map: this.map,
      title: this.data.name,
    })
    this.marker = userMark;
  }

  /**
   * creates and renders an event marker + info window on the Map with given
    api response data
    * @param {object} position - object containing singular event response data from eventbrite api
    * @param {number} index - number to index its position in the array
    * @return {none} - nothing
   */

  renderEvent(event, index) {
    const position = {
      lat: parseFloat(event.venue.address.latitude),
      lng: parseFloat(event.venue.address.longitude)
    }
    this.position = position;
    const icon = {
      url: "assets/images/icons8-event-64.png", // url
      scaledSize: new google.maps.Size(30, 30), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    this.type = "events"
    this.name = event.name.text;
    const infoWindow = new google.maps.InfoWindow({
      content: `<div class="eventInfoWindow infoWindow"><div>${this.name}</div>
                <div>${this.data.venue.address.localized_multi_line_address_display[0]}</div>
                <div>${this.data.venue.address.localized_multi_line_address_display[1]}</div>
                <div id="event${index}" class="route addLocation">Add Location To Route</div></div>`
    })
    this.infoWindow = infoWindow;
    this.marker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: event.name.text,
      icon: icon
    });
    this.marker.addListener('click', this.eventClickHandler);
    this.domElement.click(() => {
      this.closeWindows();
      this.infoWindow.open(this.map, this.marker)
    })
    this.marker.addListener('click', () => {
      this.closeWindows();
      this.infoWindow.open(this.map, this.marker)
      this.markerExpandClickHandler(this.domElement);
    });

  }

  /**
    * creates and renders a business marker + info window on the Map with given
    * api response data
    * @param {object} position: object containing singular business response data from Yelp api
    * @param {number} index: number to index its position in the array
    * @return {none}
   */
  renderBiz(biz, index) {
    const position = {
      lat: parseFloat(biz.coordinates.latitude),
      lng: parseFloat(biz.coordinates.longitude)
    }
    this.position = position;
    const icon = {
      url: "assets/images/icons8-beer-48.png", // url
      scaledSize: new google.maps.Size(35, 35), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };

    this.type = "business";
    this.name = biz.name;

    const infoWindow = new google.maps.InfoWindow({
      content: `<div class="businessInfoWindow infoWindow"><div>${this.name}</div>
                <div id="business${index}" class="route addLocation">Add location to route</div></div>`
    })
    this.infoWindow = infoWindow;

    this.marker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: biz.name,
      icon: icon
    })
    this.marker.addListener('click', this.eventClickHandler);
    this.domElement.click(() => {
      this.closeWindows();
      this.infoWindow.open(this.map, this.marker)
    })
    this.marker.addListener('click', () => {
      this.closeWindows();
      this.infoWindow.open(this.map, this.marker)
      this.markerExpandClickHandler(this.domElement);
    });
  }


  /*
    click handler for marker object to set the position of the map to the marker
  */
  eventClickHandler() {
    this.updateCenterCallback(this.position);
  }
}
