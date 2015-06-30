var cal
var highlighted = []

$(displayCalMap(null,null))


function displayCalMap(SW,NE){
	// TODO: For testing implement dummy data
	cal = new CalHeatMap();
	cal.init({
		weekStartonMonday: true,
		domain: "day",
		subdomain: "x_hour",
		cellSize: 30,
		data: "/convertDateFormat?southWest=" + SW + "&northEast=" + NE,
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
		}

	});
}

function changeData(SW, NE){
	SW = 2
	var changedData
	$.ajax({
		url: "/convertDateFormat?southWest=" + SW + "&northEast=" + NE,
	})
	.done(function(data){changeData = JSON.parse(data)})
	cal.update(changedData)
	cal.options.data = changedData
}
