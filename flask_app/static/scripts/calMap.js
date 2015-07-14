var cal
var highlighted = []

function displayCalMap(){
	cal = new CalHeatMap();
	cal.init({
		weekStartonMonday: true,
		domain: "day",
		subdomain: "x_hour",
		cellSize: 30,
		data: null, // "getCalmapData?SouthWest=" + SW + "&NorthEast=" + NE
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
		legend: [50, 100, 1000, 5000, 10000, 11000],
		considerMissingDataAsZero: true,
		label: {
			position: "left",
			width: 46,
		},
		onClick: function(date, count){
			var index = highlighted.map(Number).indexOf(+date)
			if(index != -1){
				highlighted.splice(index,1)
			}else{
				highlighted.push(date)
			}
			if (highlighted.length == 0){
				cal.highlight("now")
			}else{
				cal.highlight(highlighted)
			}
			setCalmapSelection(highlighted)
		}
	});
}

var i = 0
function calmapCallback(calmapData) {
	var changedData = JSON.parse(calmapData)
	i++
	if (i % 2 == 0) {
		changedData[946863840] += 5000
		changedData[946874520] += 5000
	}
	cal.update(changedData)
	cal.options.data = changedData
}
