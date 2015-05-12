var map;


$(function getMarker(){
	$.getJSON($SCRIPT_ROOT + "/showMarker", function(data){
		initialize(data);
		google.maps.event.addDomListener(window, 'load', initialize);
		//for each (point in data){
		buildMarker(data)
		//}
	});
});

function initialize(point) {
	var latLong = new google.maps.LatLng(point.lat, point.long)
	var mapOptions = {
		zoom: 15,
		center: latLong
	};
	map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);
	console.log("map initialized");

}

function buildMarker(point){
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(point.lat, point.long),
		map: map,
		title: 'test'
	});
}


