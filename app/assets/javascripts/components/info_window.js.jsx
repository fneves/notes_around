var InfoWindow = React.createClass({

  render: function() {
    return (<div class='InfoWindow'><img src={this.props.note.pic}></img>{this.props.note.body}</div>);
  }
});
