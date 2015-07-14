var googlemap;
var heatmap;
var boundsChanged = false;
function initHeatmap() {
	google.maps.event.addDomListener(window, 'load', function() {
		var newYorkCity = new google.maps.LatLng(40.76103210449219, -73.97576141357422);

		googlemap = new google.maps.Map(document.getElementById('map-canvas'), {
		  center: newYorkCity,
		  zoom: 11,
		  mapTypeId: google.maps.MapTypeId.SATELLITE,
		  disableDefaultUI: true
		})
		google.maps.event.addListener(googlemap, 'bounds_changed', function(){boundsChanged = true})
		google.maps.event.addListener(googlemap, 'idle', adjustBoundsData)

		// heatMapDummy(); // TODO: Durch Backend implementierung ersetzen
	});
}

function heatMapCallback(data){
	data = JSON.parse(data)
	heatLayer = []
	for(var i = 0; i < data.length; i++){
		var current = data[i]
		heatLayer.push(new google.maps.LatLng(current.lat, current.long))
	}
	if (heatmap) heatmap.setMap(null)
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatLayer
	})
	heatmap.setMap(googlemap)
}

function adjustBoundsData(){
	if (boundsChanged == true){
		var southWestBound = googlemap.getBounds().getSouthWest()
		var northEastBound = googlemap.getBounds().getNorthEast()
		setHeatmapBounds(southWestBound, northEastBound)
		boundsChanged = false
	}
}

