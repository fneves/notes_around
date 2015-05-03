// @jsx React.DOM

WS = new WebSocket("ws://" + location.host + "/notes/live");

var Marker = React.createClass({
  render: function () {
    return (<div class="InfoWindow">{ this.props.body }</div>);
  }
});

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

var NotesAroundMap = React.createClass({
  mixins: [LocationMixin],
  map: null,
  ws: WS,
  notes: [],
  currentInfoWindow: null,

  getDefaultProps: function() {
    return {
      coords: {
        lat: -33,
        lng:151
      }
    }
  },

  render: function() {
    return <div className="GMap">
      <div id="map_canvas" className='map_canvas'>
      </div>
    </div>
  },

  componentDidMount: function() {
    var self = this;
    if (Modernizr.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        self.props.coords.lat = position.coords.latitude;
        self.props.coords.lng = position.coords.longitude;
        self.map = self.createMap();
        google.maps.event.addListener(self.map, 'zoom_changed', self.handleZoomChange);
        google.maps.event.addListener(self.map, 'dragend', self.handleDragEnd);
      });
    } else {
      this.map = this.createMap();
      google.maps.event.addListener(this.map, 'zoom_changed', this.handleZoomChange);
      google.maps.event.addListener(this.map, 'dragend', this.handleDragEnd);
    }

    this.ws.onmessage = function (payload) {
      self.displayNote(JSON.parse(payload.data));
    };
  },

  createMap: function() {
    var mapOptions = {
      zoom: 4,
      center: this.currentLocation()
    };
    return new google.maps.Map(this.getDOMNode(), mapOptions)
  },

  createMarker: function(lat, lng) {
    return new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: this.map
    });
  },

  createInfoWindow: function() {
    var contentString = "<div class='InfoWindow'>I'm a Window that contains Info Yay</div>";
    return new google.maps.InfoWindow({
      map: this.map,
      anchor: this.marker,
      content: contentString
    });
  },

  handleZoomChange: function() {

  },

  handleDragEnd: function() {
    console.log('dragEnd');
    this.ws.publish('/notes', { message: 'Just Moved the map' });
  },

  currentLocation: function() {
    return this.location(this.props.coords.lat, this.props.coords.lng)
  },

  displayNote: function(note) {
    var self = this;
    var gmarker = this.createMarker(note.lat, note.lng);

    var marker = new Marker({ body: note.body, gmarker: gmarker });
    var infoWindow = new google.maps.InfoWindow({
      content: React.renderToString(marker.render())
    });

    google.maps.event.addListener(gmarker, 'click', function() {
      infoWindow.open(self.map, gmarker);
      self.currentInfoWindow.close();
      self.currentInfoWindow = infoWindow;
    });

    this.notes.push(marker)
  }
});
