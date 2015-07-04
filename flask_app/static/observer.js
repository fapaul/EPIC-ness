
var yearData,
	monthData,
	weekData

var selectedYears = [1],
		selectedMonths = [0, 1],
		selectedWeeks = [1, 4]

var northEast,
	southWest

var calmapSelection = [[1, 18], [2, 18], [3, 18], [4, 18], [5, 15]]

var locked = false


// --- OBSERVER ---------------------------------------------- //

$(function initObserver() {
	// Barcharts
	loadBarchartsData();

	// Heatmap
	initHeatmap();

	// Calmap
	displayCalMap();
})

// -- Variable updates --------------------------------------- //

function changeBarchartSelection(barData) {
	var name = "year"
	if (barData != null) {
		name = Object.keys(barData)[0] // key name: "year", "month" or "week"
	}
	handleNewBarElement(barData, name)
	// Update Barcharts (abhängig vom angeklickten Diagramm)
	updateBarCharts(name)
	updateHeatmap()
	updateCalmap()
}

function setHeatmapBounds(northEastBound, southWestBound) {
	southWest = {'lat': southWestBound.A, 'long': southWestBound.F}
	northEast = {'lat': northEastBound.A, 'long': northEastBound.F}
	updateHeatMap()
	updateCalMap()
}

function setCalmapSelection(highlighted) {
	// TODO: Save elements in highlighted in a global variable in observer.js
	// Example: calmapSelection = [[1, 18], [2, 18]] -> Montag und Dienstag um 18:00 Uhr
	updateHeatMap();
}

function requestLock() {
	if (locked) {
		return false
	} else {
		//console.log('! Actions locked !')
		locked = true
		return true
	}
}

function releaseLock() {
	if (locked) {
		//console.log('! Actions lock released !')
		locked = false
		return true
	} else {
		return false
	}
}

// --- UPDATES ----------------------------------------------- //

function updateBarCharts(name) {
	if (name == "year") {
		// Loads new data, reloads bar chart and releases lock
		updateMonthsWeeks(selectedYears, selectedMonths)
	} else if (name == "month") {
		// Loads new data, reloads bar chart and releases lock
		updateWeeks(selectedYears, selectedMonths)
	} else if (name == "week") {
	// No bar chart changes
		releaseLock()
	}
}

function updateHeatmap() {
	years = selectedYears.map(function(index){return yearData['index']})
	months = selectedMonths.map(function(index){return monthData['index']})
	weeks = selectedWeeks.map(function(index){return weekData['index']})
	// TODO: Get hours of days from Calmap
	// Example: Montag-Donnerstag um 18:00(bis 18:59) und Freitag um 16:00(bis 16:59)
	dayHours = [[1, 18], [2, 18], [3, 18], [4, 18], [5, 16]]

	$.ajax({
		type: "POST",
		url: "/heatmap",
		data: {
			"years": years,
			"months": months,
			"weeks": weeks,
			"dayHours": dayHours,
			"SouthWest": southWest,
			"NorthEast": northEast
		},
		success: heatMapCallback
	})
}

function updateCalMap() {
	years = selectedYears.map(function(index){return yearData['index']})
	months = selectedMonths.map(function(index){return monthData['index']})
	weeks = selectedWeeks.map(function(index){return weekData['index']})
	// TODO: Get hours of days from Calmap
	// Example: Montag-Donnerstag um 18:00(bis 18:59) und Freitag um 16:00(bis 16:59)
	dayHours = [[1, 18], [2, 18], [3, 18], [4, 18], [5, 16]]

	$.ajax({
		type: "POST",
		url: "/getCalmapFata",
		data: {
			"years": years,
			"months": months,
			"weeks": weeks,
			"dayHours": dayHours,
			"SouthWest": southWest,
			"NorthEast": northEast
		},
		success: calmapCallback
		"?southWest=" + SW + "&northEast=" + NE,
	})
	.done(function)
}
