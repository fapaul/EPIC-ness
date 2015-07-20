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
				$('.gmnoprint').css('display', 'none')
				$('.gm-style-cc').css('display','none')
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

function heatmapCallback(data){
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
		var southWestBound = googlemap.getBounds().getSouthWest()
		var northEastBound = googlemap.getBounds().getNorthEast()
		setHeatmapBounds(southWestBound, northEastBound)
}
