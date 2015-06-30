$(function getMarker(){
	google.maps.event.addDomListener(window, 'load', initializeHeatmap);
});

var googlemap;
var heatmap;
function initializeHeatmap() {
	var newYorkCity = new google.maps.LatLng(40.76103210449219, -73.97576141357422);

	googlemap = new google.maps.Map(document.getElementById('map-canvas'), {
	  center: newYorkCity,
	  zoom: 11,
	  mapTypeId: google.maps.MapTypeId.SATELLITE
	})

	google.maps.event.addListener(googlemap, 'idle', adjustData)

	heatMapDummy(); // TODO: Durch Backend implementierung ersetzen
}


function heatMapCallback(heatmapData) {
	heatmapData = JSON.parse(heatmapData)
	for(var i = 0; i < heatmapData.length; i++) {
		heatmapData[i] = new google.maps.LatLng(heatmapData[i]['lat'], heatmapData[i]['long'])
	}

	heatmap.setMap(null)

	heatmap = new google.maps.visualization.HeatmapLayer({
	  data: heatmapData
	});
	heatmap.setMap(googlemap);
}

function adjustData(){
	var southWestBound = googlemap.getBounds().getSouthWest()
	var northEastBound = googlemap.getBounds().getNorthEast()
	southWest = {'lat': southWestBound.A, 'long': southWestBound.F}
	northEast = {'lat': northEastBound.A, 'long': northEastBound.F}
	updateCalMap()
	$.ajax({
		type: "POST",
		url: "/getBoundsData",
		data: {"SouthWest": southWest, "NorthEast": northEast},
		success: adaptHeatMap
	})

}

function adaptHeatMap(data){
	data = JSON.parse(data)
	heatLayer = []
	for(var i = 0; i < data.length; i++){
		var current = data[i]
		heatLayer.push(new google.maps.LatLng(current.lat, current.long))
	}
	heatmap.setMap(null)
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatLayer
	})
	heatmap.setMap(googlemap)
}
