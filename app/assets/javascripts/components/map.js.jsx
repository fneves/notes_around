// @jsx React.DOM

SSE = new EventSource('/sse');

var NotesAroundMap = React.createClass({
  mixins: [LocationMixin],
  map: null,
  oms: null,
  source: SSE,
  notes: [],
  currentInfoWindow: null,

  getDefaultProps: function() {
    return {
      coords: {
        lat: 53.350140,
        lng: -6.266155
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
    this.map = this.createMap();
    google.maps.event.addListener(this.map, 'zoom_changed', this.handleZoomChange);
    google.maps.event.addListener(this.map, 'dragend', this.handleDragEnd);

    if (Modernizr.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        self.props.coords.lat = position.coords.latitude;
        self.props.coords.lng = position.coords.longitude;
        self.map.setZoom(8);
        self.map.panTo(self.currentLocation());
      });
    } else {
      console.log('Browser is not supported! Please use a decent browser!')
    }

    $.getJSON('/notes/near.json', { lat: self.props.coords.lat, lng: self.props.coords.lng })
     .done(function(data) {
      self.updateCurrentNotes(data.notes);
     });

    this.source.addEventListener('/notes/create', function(e) {
      self.displayNote(JSON.parse(e.data));
    }, true);

  },

  createMap: function() {
    var mapOptions = {
      zoom: 4,
      center: this.currentLocation()
    };
    var map = new google.maps.Map(this.getDOMNode(), mapOptions)
    this.spiderify(map);
    return map;
  },

  spiderify: function(map) {
    var overlappingOptions = {
      markersWontMove: true,
      markersWontHide: true,
      keepSpiderfied: true
    };
    this.oms = new OverlappingMarkerSpiderfier(map, overlappingOptions);
    this.oms.addListener('click', this.displayInfoWindow);
  },

  createMarker: function(note) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(note.lat, note.lng),
      map: this.map
    });
    marker.body = note.body;
    marker.pic = note.pic;
    return marker;
  },

  createInfoWindow: function(marker) {
    var content = new InfoWindow({ note: marker }).render();
    var iw = new google.maps.InfoWindow();
    iw.setContent(React.renderToStaticMarkup(content));
    return iw;
  },

  handleZoomChange: function() {

  },

  updateCurrentNotes: function(newNotes) {
    var oldNotes = this.notes.slice();
    this.notes = [];
    newNotes.forEach(this.displayNote);
    if(oldNotes != null) {
      oldNotes.forEach(this.destroyMarker);
    }
  },

  handleDragEnd: function() {
    console.log('dragEnd');
  },

  currentLocation: function() {
    return this.location(this.props.coords.lat, this.props.coords.lng);
  },

  destroyMarker: function(note) {
    oms.removeMarker(note);
    note.setMap(null);
  },

  displayInfoWindow: function(marker, e) {
    var infoWindow = this.createInfoWindow(marker);
    infoWindow.open(this.map, marker);
    if(this.currentInfoWindow) {
      this.currentInfoWindow.close();
      this.currentInfoWindow = infoWindow;
    }
    this.map.panTo(marker.getPosition());
  },

  displayNote: function(note) {
    var self = this;
    var marker = this.createMarker(note);
    this.oms.addMarker(marker);
    this.notes.push(marker);
  }
});
