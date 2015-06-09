$(function displayCalMap(){
	var cal = new CalHeatMap();
	cal.init({
		weekStartonMonday: true,
		domain: "day",
		subdomain: "x_hour",
		cellSize: 30,
		data: "/static/calMapData.json",
		start: new Date(2000, 0, 3, 6),
		browsing: true,
		range: 7,
		colLimit: 24,
		domainMargin: [0, 0, 0 , 20],
		verticalOrientation: true,
		domainLabelFormat: "%A",
		domainGutter: 5,
		legendHorizontalPosition: "center",
		label: {
			position: "left",
			width: 46,
		}

	});
	console.log(cal.data);
	console.log("succeed");
})
