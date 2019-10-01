class Yelp {
  /**
 * parameters that get passed in when yelp class is instantiated
 * class for yelp api
 * @param latitude, longitude
 * @return - none
 *
 */
  constructor(userLatitude, userLongitude, addLocationClickHandler) {
    this.apiKey = yelpApi;
    this.userLatitude = userLatitude;
    this.userLongitude = userLongitude;
    this.businessesData = null;
    this.businessesToDisplay = null;
    this.domElements = {
      businessContainer: $('.businessContainer')
    }
    this.addLocation = addLocationClickHandler;
  }
  /**
 * contains ajax call for yelp api
 * uses php file for proxy server to bypass CORS
 * @param none
 * @return - none
 *
 */
  retrieveData() {
    return new Promise((resolve, reject) => {
      $.ajax({
        'url': `php/yelp.php`,
        'dataType': 'JSON',
        'headers': {
          "Authorization": 'Bearer a_BrDbXlVK8u3TbVbpFRC9EP6Ye_73iUJQvTRDbJBrbD_e0t9x4OqWni0XZK8hE_VLr2GLWHBfgrEDdY6jZO16i1Gq5tMTBIBczxbqU1e2P3-cOOmkTUVgNE0TiAXXYx',
        },
        data: {
          'term': 'bars',
          'latitude': this.userLatitude,
          'longitude': this.userLongitude,
          'radius': 16093
        },
        success: (data) => {
          this.businessesData = data;
          this.displayToBusinessList();
          resolve(this.businessesData);
        },
        error: (data) => {
          console.log('There was an error recieving data on the yelp object.');
          reject(data);
        }
      })
    })
  }
  /**
  * converts data to be able to be rendered to dom
  * @param none
  * @return - none
  *
  */
  displayToBusinessList() {
    for (var bizIndex = 0; bizIndex < this.businessesData.businesses.length; bizIndex++) {
      var business = this.businessesData.businesses[bizIndex];
      var businessCats = ""
      business.categories.map((cat) => {
        businessCats += cat.title + "<br>";
      });
      var businessInfo = $("<div>", {
        class: "business-info",
        html: `
                          <div class=rating-count>reviews: ${business.review_count}</div>
                          <div class="address">
                          ${business.location.display_address[0]}<br>
                          ${business.location.display_address[1]}<br>
                          </div>
                          <div class="categories">
                          ${businessCats}
                          </div>
                          <a href=${business.url} target="_blank" >Visit Yelp<a>`
      })
      var businessName = business.name;
      var businessRating = business.rating;
      var addToRouteButton = $('<div>').addClass('route addLocation').attr('id', 'business' + bizIndex).text('Add Location To Route').click(this.addLocation);
      var businessNameContainer = $('<div>').addClass('businessName').text(businessName);
      var businessRatingContainer = $('<div>').addClass('rating').css('background-image', `url('assets/images/ratings/${businessRating}.png')`);
      var businessContainer = $('<div>').addClass(`business business${bizIndex}`).css('background-image', `url('assets/images/icons8-beer-48.png')`).attr("id", "business" + bizIndex);
      businessContainer.append(businessNameContainer, businessRatingContainer, businessInfo, addToRouteButton);
      this.domElements.businessContainer.append(businessContainer);
    }
  }

  /**
  * Gets coordiantes for businesses
  * @param {string} type - lat or lng
  * @param {num} id - id of business
  * @return {num} - lat or lng of business
  *
  */
  getCoordinatesById(type, id) {
    switch (type) {
      case 'lat':
        return this.businessesData.businesses[id].coordinates.latitude;
      case 'lng':
        return this.businessesData.businesses[id].coordinates.longitude;
    }
  }

}
