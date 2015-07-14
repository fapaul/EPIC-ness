var UPDATE_DELAY = 3 // Seconds (waiting after input)

var yearData = [{'year': '2010'}, {'year': '2011'}, {'year': '2012'}, {'year': '2013'}],
	monthData = [{'month': 1}],
	weekData = [{'week': 1}]

var selectedYears = [1],
		selectedMonths = [0, 1],
		selectedWeeks = [1, 4]

var northEast,
	southWest

var calmapSelection = [[1, 18], [2, 18], [3, 18], [4, 18], [5, 15]]

var locked = false


// --- OBSERVER ---------------------------------------------- //

$(function initObserver() {
	origDelay = UPDATE_DELAY
	UPDATE_DELAY = 0

	// Barcharts
	loadBarchartsData();

	// Heatmap
	initHeatmap();

	// Calmap
	displayCalMap();

	UPDATE_DELAY = origDelay
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
	updateHeatMap()
	updateCalMap()
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

var barchartsCallID = -1
function updateBarCharts(name) {
	setTimeout(function(myID){
		// Check ID
		if (myID == barchartsCallID) {
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
		} else {
			releaseLock()
		}
	}, UPDATE_DELAY * 1000, ++barchartsCallID)
}

var heatmapCallID = -1
function updateHeatMap() {
	setTimeout(function(myID){
		// Check ID
		if (myID == heatmapCallID) {
			years = selectedYears.map(function(index){return yearData[index]['year']})
			months = selectedMonths.map(function(index){return (index+1)+""})
			weeks = selectedWeeks.map(function(index){return (index+1)+""})
			// TODO: Get hours of days from Calmap
			// Example: Montag-Donnerstag um 18:00(bis 18:59) und Freitag um 16:00(bis 16:59)
			dayHours = [[1, 18], [2, 18], [3, 18], [4, 18], [5, 16]]

			$.ajax({
				type: "POST",
				url: "/getHeatMapData",
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
	}, UPDATE_DELAY * 1000, ++heatmapCallID)
}

var calmapCallID = -1
function updateCalMap() {
	setTimeout(function(myID){
		// Check ID
		if (myID == calmapCallID) {
			years = selectedYears.map(function(index){return yearData[index]['year']})
			months = selectedMonths.map(function(index){return (index+1)+""})
			weeks = selectedWeeks.map(function(index){return (index+1)+""})
			// TODO: Get hours of days from Calmap
			// Example: Montag-Donnerstag um 18:00(bis 18:59) und Freitag um 16:00(bis 16:59)

			$.ajax({
				type: "POST",
				url: "/getCalMapData",
				data: {
					"years": years,
					"months": months,
					"weeks": weeks,
					"SouthWest": southWest,
					"NorthEast": northEast
				},
				success: calmapCallback
			})
		}
	}, UPDATE_DELAY * 1000, ++calmapCallID)
}
