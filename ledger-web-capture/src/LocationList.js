import React, { Component } from 'react';
import { debounce } from 'throttle-debounce';

var api_headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
if(window.HTTP_AUTH) { api_headers['Authorization'] = window.HTTP_AUTH; }

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

class LocationList extends Component {
    constructor(props) {
	super(props);

	this.triggerSearch = debounce(500, this.triggerSearch);

	this.state = {
	    isLoading: true,
	    list: []
	};
    }

    getCurrentLocation = (options) => {
	return new Promise(function (resolve, reject) {
	    navigator.geolocation.getCurrentPosition(resolve, reject, options);
	});
    }

    getNearbyLocations = () => {
	this.getCurrentLocation({ enableHighAccuracy: true })
	    .then(({ coords }) => {
		this.setState({ coords: { lat: coords.latitude, lng: coords.longitude} });
		return fetch("/maps/api/place/nearbysearch/json?location=" + coords.latitude+ "," + coords.longitude + "&radius=150&key=AIzaSyA4Kyzn8NbzUQZndq-hW4p-3viVaki5gsA", { headers: api_headers });
	    })
	    .then(response => response.json())
	    .then((json) => {
	    	this.setState({
	    	    nextPageToken: json.next_page_token,
	    	    list: json.results
	    	});
	    });
    }

    searchLocations = (name) => {
	this.getCurrentLocation({ enableHighAccuracy: true })
	    .then(({ coords }) => {
		this.setState({ coords: { lat: coords.latitude, lng: coords.longitude} });
		return fetch("/maps/api/place/nearbysearch/json?location=" + coords.latitude+ "," + coords.longitude + "&name=" + name + "&rankby=distance&key=AIzaSyA4Kyzn8NbzUQZndq-hW4p-3viVaki5gsA", { headers: api_headers });
	    })
	    .then((response) => {
		return response.json();
	    })
	    .then((json) => {
		this.setState({
		    nextPageToken: json.next_page_token,
		    list: json.results
		});
	    });
    }

    loadMore = () => {
	console.log("Load More")
	fetch("/maps/api/place/nearbysearch/json?pagetoken=" + this.state.nextPageToken + "&key=AIzaSyA4Kyzn8NbzUQZndq-hW4p-3viVaki5gsA", { headers: api_headers })
	    .then((response) => { return response.json(); })
	    .then((json) => {
		console.log(json);
		this.setState((prevState) => ({
		    nextPageToken: json.next_page_token,
		    list: prevState.list.concat(json.results)
		}));
	    });
    }

    triggerSearch = (value) => {
	if(value === "") {
	    this.getNearbyLocations();
	} else {
	    this.searchLocations(value);
	}
    }

    searchNameChanged = (event) => {
	this.triggerSearch(event.target.value);
    }

    componentDidMount() {
	this.getNearbyLocations();
    }

    distance = (item) => {
	return getDistanceFromLatLonInKm(
	    this.state.coords.lat,
	    this.state.coords.lng,
	    item.geometry.location.lat,
	    item.geometry.location.lng
	).toFixed(2);
    }

    render() {
	return (
	    <div className="react-capture">
	      <header>
		<button className="back" onClick={this.props.onBack}></button>
		<div className="group">
		  <input
		    name="searchName"
		    type="search"
		    defaultValue={this.props.location}
		    placeholder="Search nearby ..."
		    onChange={this.searchNameChanged}
		    onFocus={(e) => {
			var val = e.target.value;
			e.target.value = '';
			e.target.value = val;
		    }}
		    autoComplete="off"
		    autoFocus />
		  <span className="bar"></span>
		</div>
	      </header>
	      <div className="content">
		<ul className="collection">
		  {this.state.list.map(item => { return <li key={item.name} onClick={() => { this.props.onSelect(item); }}> <span className="distance">{this.distance(item)} km</span> <span className="title">{item.name}</span> <p>{item.vicinity}</p> </li>;})}
		  {this.state.nextPageToken && (<li className="load-more"><a onClick={this.loadMore}>Load more ...</a></li>)}
	        </ul>
	      </div>
	    </div>
	);
    }
}

export default LocationList;
