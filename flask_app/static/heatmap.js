$(function getMarker(){
	google.maps.event.addDomListener(window, 'load', initializeHeatmap);
});

var googlemap;
function initializeHeatmap() {
	var newYorkCity = new google.maps.LatLng(40.76103210449219, -73.97576141357422);

	googlemap = new google.maps.Map(document.getElementById('map-canvas'), {
	  center: newYorkCity,
	  zoom: 11,
	  mapTypeId: google.maps.MapTypeId.SATELLITE
	})

	google.maps.event.addListener(googlemap, 'idle', adjustData)

	heatMapDummy();
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

var heatmap;
function heatMapDummy(){
	var heatmapData = [
	  new google.maps.LatLng(40.645320892333984, -73.7768783569336),
	  new google.maps.LatLng(40.72430419921875, -73.9999008178711),
	  new google.maps.LatLng(40.762916564941406, -73.99524688720703),
	  new google.maps.LatLng(40.747989654541016, -73.97357940673828),
	  new google.maps.LatLng(40.68174362182617, -73.98006439208984),
	  new google.maps.LatLng(40.774208068847656, -73.87296295166016),
	  new google.maps.LatLng(40.75990676879883, -73.99391174316406),
	  new google.maps.LatLng(40.76718521118164, -73.99007415771484),
	  new google.maps.LatLng(40.645050048828125, -73.79256439208984),
	  new google.maps.LatLng(40.751739501953125, -73.89812469482422),
	  new google.maps.LatLng(40.78850555419922, -73.94905853271484),
	  new google.maps.LatLng(40.72579574584961, -73.9828872680664),
	  new google.maps.LatLng(40.72705078125, -73.99354553222656),
	  new google.maps.LatLng(40.74961853027344, -73.99532318115234),
	  new google.maps.LatLng(40.75189971923828, -73.97854614257812),
	  new google.maps.LatLng(40.7713737487793, -73.94850158691406),
	  new google.maps.LatLng(40.78081130981445, -73.95891571044922),
	  new google.maps.LatLng(40.71111297607422, -74.01576232910156),
	  new google.maps.LatLng(40.785133361816406, -73.95137786865234),
	  new google.maps.LatLng(40.77518844604492, -73.95879364013672),
	  new google.maps.LatLng(40.648643493652344, -73.78377532958984),
	  new google.maps.LatLng(40.73469543457031, -73.99658966064453),
	  new google.maps.LatLng(40.769466400146484, -73.86385345458984),
	  new google.maps.LatLng(40.73362350463867, -74.00254821777344),
	  new google.maps.LatLng(40.778892517089844, -73.96232604980469),
	  new google.maps.LatLng(40.719234466552734, -73.99076080322266),
	  new google.maps.LatLng(40.732032775878906, -73.99650573730469),
	  new google.maps.LatLng(40.73330307006836, -73.9873275756836),
	  new google.maps.LatLng(40.76991653442383, -73.86360168457031),
	  new google.maps.LatLng(40.76443862915039, -73.99576568603516),
	  new google.maps.LatLng(40.669219970703125, -73.98957824707031),
	  new google.maps.LatLng(40.74040222167969, -73.99468994140625),
	  new google.maps.LatLng(40.76493835449219, -73.9840316772461),
	  new google.maps.LatLng(40.71689224243164, -73.99781799316406),
	  new google.maps.LatLng(40.7739143371582, -73.87100982666016),
	  new google.maps.LatLng(40.741973876953125, -74.00394439697266),
	  new google.maps.LatLng(40.77421188354492, -73.87305450439453),
	  new google.maps.LatLng(40.77899932861328, -73.9484634399414),
	  new google.maps.LatLng(40.70967483520508, -74.01583862304688),
	  new google.maps.LatLng(40.7723274230957, -73.9466323852539),
	  new google.maps.LatLng(40.760475158691406, -74.00289154052734),
	  new google.maps.LatLng(40.746334075927734, -74.00130462646484),
	  new google.maps.LatLng(40.64455795288086, -73.78205108642578),
	  new google.maps.LatLng(40.74110794067383, -74.00174713134766),
	  new google.maps.LatLng(40.760169982910156, -73.97663879394531),
	  new google.maps.LatLng(40.755096435546875, -73.9802474975586),
	  new google.maps.LatLng(40.75562286376953, -73.98596954345703),
	  new google.maps.LatLng(40.749942779541016, -73.97540283203125),
	  new google.maps.LatLng(40.70598602294922, -74.0060806274414),
	  new google.maps.LatLng(40.7518196105957, -73.97822570800781),
	  new google.maps.LatLng(40.76826858520508, -73.99279022216797),
	  new google.maps.LatLng(40.7407341003418, -74.0075454711914),
	  new google.maps.LatLng(40.740867614746094, -73.98178100585938),
	  new google.maps.LatLng(40.75688552856445, -73.98298645019531),
	  new google.maps.LatLng(40.641326904296875, -73.7889404296875),
	  new google.maps.LatLng(40.724761962890625, -73.99472045898438),
	  new google.maps.LatLng(40.73403549194336, -73.98070526123047),
	  new google.maps.LatLng(40.75443649291992, -73.99554443359375),
	  new google.maps.LatLng(40.78974914550781, -73.97734069824219),
	  new google.maps.LatLng(40.74892807006836, -73.98866271972656),
	  new google.maps.LatLng(40.78984451293945, -73.95453643798828),
	  new google.maps.LatLng(40.74250793457031, -73.98056030273438),
	  new google.maps.LatLng(40.7689208984375, -73.86295318603516),
	  new google.maps.LatLng(40.75428771972656, -73.99243927001953),
	  new google.maps.LatLng(40.757606506347656, -73.96955108642578),
	  new google.maps.LatLng(40.76825714111328, -73.96157836914062),
	  new google.maps.LatLng(40.75658416748047, -73.99142456054688),
	  new google.maps.LatLng(40.726680755615234, -73.9889907836914),
	  new google.maps.LatLng(40.77650833129883, -73.96004486083984),
	  new google.maps.LatLng(40.774044036865234, -73.87305450439453),
	  new google.maps.LatLng(40.74931335449219, -73.9766845703125),
	  new google.maps.LatLng(40.74992752075195, -73.9897232055664),
	  new google.maps.LatLng(40.76079559326172, -73.96742248535156),
	  new google.maps.LatLng(40.760616302490234, -73.99383544921875),
	  new google.maps.LatLng(40.765785217285156, -73.9833755493164),
	  new google.maps.LatLng(40.77536392211914, -73.98249053955078),
	  new google.maps.LatLng(40.751976013183594, -73.9736328125),
	  new google.maps.LatLng(40.75017547607422, -73.97692108154297),
	  new google.maps.LatLng(40.736629486083984, -73.99087524414062),
	  new google.maps.LatLng(40.75655746459961, -73.98665618896484),
	  new google.maps.LatLng(40.7022819519043, -74.01380920410156),
	  new google.maps.LatLng(40.76130676269531, -73.9883041381836),
	  new google.maps.LatLng(40.76103210449219, -73.97576141357422),
	  new google.maps.LatLng(40.75702667236328, -73.97488403320312),
	  new google.maps.LatLng(40.77058792114258, -73.86487579345703),
	  new google.maps.LatLng(40.73277282714844, -73.98773193359375),
	  new google.maps.LatLng(40.76629638671875, -73.9826889038086),
	  new google.maps.LatLng(40.64912414550781, -73.78569030761719),
	  new google.maps.LatLng(40.716976165771484, -73.99859619140625),
	  new google.maps.LatLng(40.6453857421875, -73.77677917480469),
	  new google.maps.LatLng(40.755985260009766, -73.9752426147461),
	  new google.maps.LatLng(40.75959777832031, -73.96575164794922),
	  new google.maps.LatLng(40.68998718261719, -73.98139953613281),
	  new google.maps.LatLng(40.741912841796875, -74.00466918945312),
	  new google.maps.LatLng(40.743988037109375, -74.00321960449219),
	  new google.maps.LatLng(40.70903015136719, -74.01697540283203),
	  new google.maps.LatLng(40.77823257446289, -73.95441436767578),
	  new google.maps.LatLng(40.7198486328125, -73.98739624023438),
	  new google.maps.LatLng(40.645626068115234, -73.77687072753906)
	];

	heatmap = new google.maps.visualization.HeatmapLayer({
	  data: heatmapData
	});
	heatmap.setMap(googlemap);
}

function adjustData(){
	var southWestBound = googlemap.getBounds().getSouthWest()
	var northEastBound = googlemap.getBounds().getNorthEast()
	var southWest = {'lat': southWestBound.A, 'long': southWestBound.F}
	var northEast = {'lat': northEastBound.A, 'long': northEastBound.F}
	updateCalMap(southWest, northEast)
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
