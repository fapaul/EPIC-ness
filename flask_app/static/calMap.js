$(function displayCalMap(){
	var cal = new CalHeatMap();
	cal.init({
		weekStartonMonday: true,
		domain: "day",
		subdomain: "x_hour",
		cellSize: 35,
		data: "/static/calMapData.json",
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
		}

	});
	console.log(cal.data);
	console.log("succeed");
})

//Hack: aggregate comming time stamps to 3 - 9 January 2000