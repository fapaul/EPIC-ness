var cal
var highlighted = []

function displayCalmap(){
	cal = new CalHeatMap();
	cal.init({
		weekStartonMonday: true,
		domain: "day",
		subdomain: "x_hour",
		cellSize: 30,
		data: null,
		start: new Date(2000, 0, 3, 6),
		browsing: true,
		range: 7,
		colLimit: 24,
		domainMargin: [0, 0, 0 , 20],
		verticalOrientation: true,
		subDomainTextFormat: '%H',
		domainLabelFormat: "%A",
		domainGutter: 10,
		legendHorizontalPosition: "center",
		legend: [200, 5000, 10000, 30000, 50000, 100000],
		considerMissingDataAsZero: true,
		label: {
			position: "left",
			width: 46,
		},
		onClick: function(date, count){
			if (!isLocked()) {
				var index = highlighted.map(Number).indexOf(+date)
				if(index != -1){
					highlighted.splice(index,1)
				} else{
					highlighted.push(date)
				}
				if (highlighted.length == 0){
					cal.highlight("now")
				} else{
					cal.highlight(highlighted)
				}
				setCalmapSelection(highlighted)
			} else {
				debugLog('Calmap: Couldn\'t handle clicked event because of a lock')
			}
		}
	});
	/*
		TODO:
		1.) Remove onClick-Listener from calmap init function
		2.) Add mouseDown- and mouseUp-Listener
				- for each calmap element or
				- for the whole svg element using the relevant mouse
					coordinates for selecting the right calmap element
		3.) Remove calmap array -> Send origin and extent positions
		4.) Change query using origin and extent
	*/
}

function disableCalmapControl() {
	$('#cal-heatmap').css('opacity', 0.5)
}

function enableCalmapControl() {
	$('#cal-heatmap').css('opacity', 1)
}

function calmapCallback(calmapData) {
	var changedData = JSON.parse(calmapData)
	cal.update(changedData)
	cal.options.data = changedData

	calmapDoneLoading = true;
}
