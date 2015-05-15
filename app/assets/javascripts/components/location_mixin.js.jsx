var LocationMixin = {
  location: function (lat, lng) {
    return new google.maps.LatLng(lat, lng)
  },

  currentPosition: function(callback) {
    if (Modernizr.geolocation) {
      navigator.geolocation.getCurrentPosition(callback);
    } else {
      alert("Notes around only works with a browser that support geolocation!");
    }
  },

  handleLocationUpdates: function(callback) {
    if (Modernizr.geolocation) {
      function errorHandler(err) {
        if(err.code == 1) {
          alert("Error: Access is denied!");
        }else if( err.code == 2) {
          alert("Error: Position is unavailable!");
        }
      }
      // timeout at 60000 milliseconds (60 seconds)
      var options = { timeout: 60000 };
      navigator.geolocation.watchPosition(callback, errorHandler, options);
    }else{
      alert("Sorry, browser does not support geolocation!");
    }
  }
};
