var cal
var highlighted = []

$(function displayCalMap(){
	// TODO: For testing implement dummy data
	cal = new CalHeatMap();
	cal.init({
		weekStartonMonday: true,
		domain: "day",
		subdomain: "x_hour",
		cellSize: 35,
		data: "/convertDateFormat",
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
		label: {
			position: "left",
			width: 46,
		},
		onClick: function(date, count){
			//console.log(highlighted)
			var index = highlighted.map(Number).indexOf(+date)
			//console.log(index)
			if(index != -1){
				highlighted.splice(index,1)
				//console.log("delete cell")
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
	//console.log(cal.data);
	console.log("CalHeatMap generated!");
})
