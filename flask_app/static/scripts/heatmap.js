var googlemap;
var heatmap;
var calledForFirstTime = false;
var mapLocked = false;

function initHeatmap() {
	google.maps.event.addDomListener(window, 'load', function() {
		var newYorkCity = new google.maps.LatLng(40.76103210449219, -73.97576141357422);

		googlemap = new google.maps.Map(document.getElementById('map-canvas'), {
		  center: newYorkCity,
		  zoom: 11,
		  mapTypeId: google.maps.MapTypeId.SATELLITE,
		  disableDefaultUI: true
		})
		google.maps.event.addListener(googlemap, 'bounds_changed', adjustBoundsData)
		google.maps.event.addListener(googlemap, 'tilesloaded', function(){
			if (!calledForFirstTime) { // Hide "Nutzungsbedingungen", etc. (might be illegal)
				setTimeout(function(){
					$('.gmnoprint').css('display', 'none')
					$('.gm-style-cc').css('display','none')
				}, 3000)
				calledForFirstTime = true
			}
		})

	});

}

function disableHeatmapControl() {
	if (googlemap) {
		googlemap.set('draggable', false);
		googlemap.set('scrollwheel', false);
		googlemap.set('disableDoubleClickZoom', false);
	}
	$('#map-canvas').css('opacity', 0.5)
}

function enableHeatmapControl() {
	googlemap.set('draggable', true);
	googlemap.set('scrollwheel', true);
	googlemap.set('disableDoubleClickZoom', true);
	$('#map-canvas').css('opacity', 1)
}

function regenerateHeatmapLayer(data){
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
	customGradients()
}

function adjustBoundsData(){
		var southWestBound = googlemap.getBounds().getSouthWest()
		var northEastBound = googlemap.getBounds().getNorthEast()
		setHeatmapBounds(southWestBound, northEastBound)
}

// set the color of the Heatmap to the same ones as of the Calmap
function customGradients() {
	var gradient = [
	'rgba(88, 150, 94, 1)',
	'rgba(175, 215, 179, 1)',
	'rgba(146, 213, 152, 1)',
	'rgba(102, 202, 111, 1)',
	'rgba(74, 173, 83, 1)',
	'rgba(35, 144, 45, 1)',
	'rgba(14, 115, 23, 1)',
	'rgba(8, 74, 15, 1)'
	]
	heatmap.set('gradient', gradient);
}