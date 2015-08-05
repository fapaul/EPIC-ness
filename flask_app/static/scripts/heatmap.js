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
		  mapTypeId: google.maps.MapTypeId.ROADMAP,
		  disableDefaultUI: true,
			zoomControl: true,
			styles: mapGreyScaleStyles
		})

		google.maps.event.addListener(googlemap, 'bounds_changed', adjustBoundsData)
		google.maps.event.addListener(googlemap, 'tilesloaded', function(){
			var southWestBound = googlemap.getBounds().getSouthWest()
			var northEastBound = googlemap.getBounds().getNorthEast()
			southWest = {'lat': southWestBound.G, 'long': southWestBound.K}
			northEast = {'lat': northEastBound.G, 'long': northEastBound.K}
		})

	});

}

function disableHeatmapControl() {
	if (googlemap) {
		googlemap.set('draggable', false);
		googlemap.set('scrollwheel', false);
		googlemap.set('disableDoubleClickZoom', false);
		googlemap.set('zoomControl', false);
	}
	$('#map-canvas').css('opacity', 0.5)
}

function enableHeatmapControl() {
	googlemap.set('draggable', true);
	googlemap.set('scrollwheel', true);
	googlemap.set('disableDoubleClickZoom', true);
	googlemap.set('zoomControl', true);
	$('#map-canvas').css('opacity', 1)
}

//var maxIntensity = 100000
function regenerateHeatmapLayer(data){
	data = JSON.parse(data)
	heatLayer = []

	for(var i = 0; i < data.length; i++){
		var current = data[i]
		heatLayer.push({location: new google.maps.LatLng(current.lat, current.long), weight: current.count})
	}
	if (heatmap) heatmap.setMap(null)
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatLayer,
		map: googlemap,
		//maxIntensity: (average+maxCount)/2,
		gradient: [
		'rgba(255, 255, 255, 0)',
		'rgba(96, 195, 102, 1)',
		'rgba(86, 173, 92, 1)',
		'rgba(72, 162, 81, 1)',
		'rgba(64, 153, 73, 1)',
		'rgba(35, 134, 45, 1)',
		'rgba(24, 115, 30, 1)',
		'rgba(8, 74, 15, 1)'
		]
	})
}

// x: Lat steigt nach oben (ca 40.6)
// y: Long steigt nach rechts (ca -73,8)
function adjustBoundsData(){
	// check if the new viewport is contained by the old one.
	var southWestBound = googlemap.getBounds().getSouthWest()
	var northEastBound = googlemap.getBounds().getNorthEast()
	var newZoomLevel = googlemap.getZoom()

	var newSouthWest = {'lat': southWestBound.G, 'long': southWestBound.K}
	var newNorthEast = {'lat': northEastBound.G, 'long': northEastBound.K}

	var newView = null, oldView = null
	if (northEast && southWest) {
		newView = [[newSouthWest.long,	//x1
										newNorthEast.lat],	//y1
									 [newNorthEast.long,	//x2
										newSouthWest.lat]]	//y2
		oldView = [[southWest.long-0.005,			//x3
										northEast.lat+0.005],	//y3
								   [northEast.long+0.005,	//x4
								  	southWest.lat-0.005]]	//y4
	}
	if (newView != null && oldView != null && zoomLevel != null &&
		((zoomLevel <= 12 && newZoomLevel <= 12) || (zoomLevel >= 12 && newZoomLevel >= 12)) &&
			rectIsInRect(newView, oldView)) {
 		cancelUpdate() // Dont update data
	} else {
		setHeatmapBounds(newSouthWest, newNorthEast, newZoomLevel)
	}
}

function rectIsInRect(rect1, rect2) {
	// [[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]
	// console.log(rect1, rect2, (rect1[0][0] >= rect2[0][0]), (rect1[1][0] <= rect2[1][0]),	(rect1[0][1] <= rect2[0][1]), (rect1[1][1] >= rect2[1][1]))
	return (rect1[0][0] >= rect2[0][0] && rect1[1][0] <= rect2[1][0]) &&
				(rect1[0][1] <= rect2[0][1] && rect1[1][1] >= rect2[1][1])
}
