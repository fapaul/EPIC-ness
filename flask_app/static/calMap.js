$(function displayCalMap(){
	var cal = new CalHeatMap();
	cal.init({
		domain: "hour",
		subdomain: "hour",
		data: "http://localhost:5000/static/calMapData.json",
		start: new Date(2000, 0, 1, 6),
		browsing: true,
		range: 10,

	});
	console.log(cal.data);
	console.log("succeed");
})
