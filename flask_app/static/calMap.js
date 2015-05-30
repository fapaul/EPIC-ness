$(function displayCalMap(){
	var cal = new CalHeatMap();
	cal.init({
		data: "calMapData.js",
		browsing: true,
		domain: "day",
		range: 10,

	});
})
