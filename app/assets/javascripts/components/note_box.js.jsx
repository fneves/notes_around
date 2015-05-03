var NoteBox = React.createClass({
  mixins: [LocationMixin],
  ws: WS,

  getDefaultProps: function() {
    return {
      coords: {
        lat: -33,
        lng:151
      }
    }
  },
  componentDidMount: function() {
    var self = this;
    var locationCallback = function (position) {
      console.log('new position found' + position);
      self.props.coords.lat = position.coords.latitude;
      self.props.coords.lng = position.coords.longitude;
    };
    this.currentPosition(locationCallback);
    this.handleLocationUpdates(locationCallback);
  },

  getInitialState: function () {
    return { note: '' };
  },

  textareaChanged: function(event) {
    this.setState({ note: event.target.value });
  },

  createNote: function(event) {
    var toSend = JSON.stringify({
      body: this.state.note,
      lat: this.props.coords.lat,
      lng: this.props.coords.lng
    });
    this.ws.send(toSend);
    this.setState({ note: '' });
  },

  render: function() {
    return (
      <div className='notes-box'>
        <textarea ref='notes-box' className='form-control' rows='3' value={this.state.note}
                  onChange={this.textareaChanged} />
        <button ref='submit-note' className='btn btn-primary'
          onClick={this.createNote}>Submit</button>
      </div>
    );
  }
});
