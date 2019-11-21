class Eventbrite {
  constructor(lat, lng, addLocationClickHandler) {
    this.key = eventbriteApi;
    this.eventStorage = [];
    this.data = null;
    this.lat = lat;
    this.lng = lng;
    this.domContainer = $(".eventsContainer");
    this.render = this.render.bind(this);
    this.addLocation = addLocationClickHandler;
  }

  /**
  * Retrives data from eventbrite server with AJAX Call.
  * @param - none
  * @return - Promise - resolve: response packet, reject: error response packet
  */

  retrieveData() {
    return new Promise((resolve, reject) => {
      var today = new Date();
      var dateInput = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate() + 7}T${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      $.ajax({
        url: 'https://www.eventbriteapi.com/v3/events/search',
        method: 'GET',
        dataType: 'JSON',
        headers: {
          'Authorization': 'Bearer ' + this.key
        },
        data: {
          'location.longitude': `${this.lng}`,
          'location.latitude': `${this.lat}`,
          'categories': '103',
          'start_date.range_end': dateInput,
          'location.within': '10mi',
          'expand': 'venue'
        },
        success: (response) => {
          this.data = this.postProcessData(response);
          this.render();
          resolve(response);
        },
        error: (response) => {
          reject(response);
        }
      })
    })
  }

  /**
  * Cuts down response packet to first 20 entries
  * @param (repsonse) - response packet
  * @return - trimmed packet
  */

  postProcessData(response) {
    if (response.events.length < 20) {
      return response;
    }
    response.events.splice(20);
    return response;
  }

  /**
  * creates DOM elements for events sidebar
  * @param - none
  * @return - none
  */

  render() {
    for (var eventIndex = 0; eventIndex < this.data.events.length; eventIndex++) {
      var thisEvent = this.data.events[eventIndex];
      var newEvent = {};
      var startDateTime = this.parseDateTime(thisEvent.start.local);
      var endDateTime = this.parseDateTime(thisEvent.end.local);
      newEvent.name = thisEvent.name.html;
      newEvent.description = thisEvent.description;
      newEvent.address = thisEvent.venue.localized_multi_line_address_display;
      newEvent.lat = thisEvent.venue.address.latitude;
      newEvent.lng = thisEvent.venue.address.longitude;
      this.eventStorage.push(newEvent);
      var eventDom = $("<div>", {
        id: "event" + eventIndex,
        class: "event event" + eventIndex,
        html: `<div class="event-name">${newEvent.name}</div>
              <div class="address">${thisEvent.venue.address.localized_multi_line_address_display[0]}
              <br>${thisEvent.venue.address.localized_multi_line_address_display[1]}</div>
              <div class='event-time'>${startDateTime.month}/${startDateTime.dayNum} ${startDateTime.hour}:${startDateTime.minute} ${startDateTime.ampm} - ${endDateTime.hour}:${endDateTime.minute} ${endDateTime.ampm}</div>
              <div class="event-info">Event Summary:<br>${thisEvent.summary}</div>
              <a class="event-url" href="${thisEvent.url} target=_blank">Visit Event Site</a>`
      });
      eventDom.css('background-image', `url('assets/images/icons8-event-64.png')`);
      var addToRouteButton = $('<div>').addClass('route addLocation').attr('id', 'event' + eventIndex).text('Add Location To Route').click(this.addLocation);
      eventDom.append(addToRouteButton);
      this.domContainer.append(eventDom);
    }
  }

  /**
  * splits up date from packet into object with keys
  * @param {string} - str: date from repssonse packet
  * @return {object} - object with date components as keys
  */

  parseDateTime(str) {
    var date = new Date(str);
    var minute = date.getMinutes();
    if (!minute) {
      minute = '00'
    }
    var ampm = null;
    var hour = date.getHours();
    if (hour > 12) {
      hour -= 12;
      ampm = "PM"
    }
    else {
      ampm = "AM"
    }
    return {
      dayNum: date.getDate(),
      month: date.getMonth(),
      hour: hour,
      minute: minute,
      ampm: ampm
    }
  }


  /**
  * Gets coordiantes for events
  * @param {string} type - lat or lng
  * @param {num} id - id of business
  * @return {num} - lat or lng of business
  *
  */
  getCoordinatesById(type, id) {
    switch (type) {
      case 'lat':
        return this.eventStorage[id].lat;
      case 'lng':
        return this.eventStorage[id].lng;
    }
  }

}
