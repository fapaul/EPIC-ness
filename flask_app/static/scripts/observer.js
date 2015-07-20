var UPDATE_DELAY = 3 // Seconds (waiting after input)
var DEBUG = false

var yearData = [{'year': '2010'}, {'year': '2011'}, {'year': '2012'}, {'year': '2013'}],
	monthData = [{'month': 1}],
	weekData = [{'week': 1}]

var selectedYears = [1],
		selectedMonths = [0, 1],
		selectedWeeks = [1, 4]

var northEast,
	southWest

var calmapSelection = [[1, 0], [7, 23]] // From Monday 0:00 'til Sunday 23:00

var locked = false

// --- OBSERVER ---------------------------------------------- //

$(function initObserver() {
	// Barcharts
	initBarcharts() // Generates barcharts with empty data

	// Calmap
	displayCalmap() // Generates calmap with empty data

	// Heatmap
	initHeatmap() // Generates heatmap with an event listener (->First query)
})

// -- Variable updates --------------------------------------- //

function changeBarchartSelection(barData) {
	var name // Different behavior for each barchart
	if (barData != null) {
		// "year", "month" or "week"
		name = Object.keys(barData)[0]
	} else {
		// Default value for updating all barcharts
		name = "year"
	}
	// Store clicked element
	handleNewBarElement(barData, name)
	// Update whole frontend (barcharts, heatmap, calmap)
	updateBarCharts(name)
		.then(function(){
			return updateHeatmap(true)
		}, debugRejectLog)
		.then(function(){
			return updateCalmap(true)
		}, debugRejectLog)
}

var firstTime = true
function setHeatmapBounds(northEastBound, southWestBound) {
	// Because of multiple calls by the event listener check for changes
	if (!southWest || !northEast ||
			southWest.lat != southWestBound.A || southWest.long != southWestBound.F ||
			northEast.lat != northEastBound.A || northEast.long != northEastBound.F) {
		southWest = {'lat': southWestBound.A, 'long': southWestBound.F}
		northEast = {'lat': northEastBound.A, 'long': northEastBound.F}
		updateHeatmap()
			.then(function(){return updateCalmap(true)}, debugRejectLog)
			.then(function(){
				if (firstTime) {
					firstTime = false
					if (requestLock()) {
						loadBarchartsData()
							.then(releaseLock, debugRejectLog)
					}
				}
			}, debugRejectLog)
	}
}

function setCalmapSelection(selCells) {
	// Only save first and last entry, because the selected cells form a rectangle
	calmapSelection = [selCells[0], selCells[selCells.length-1]]
	updateHeatmap()
}

function requestLock() {
	if (locked) {
		return false
	} else {
		debugLog('! Actions locked !')
		disableHeatmapControl()
		disableCalmapControl()
		disableBarchartsControl()
		locked = true
		return true
	}
}

function isLocked() {
	return locked
}

function releaseLock() {
	if (locked) {
		debugLog('! Actions lock released !')
		enableHeatmapControl()
		enableCalmapControl()
		enableBarchartsControl()
		locked = false
		return true
	} else {
		return false
	}
}

function debugLog(str) {
	if (DEBUG) {
		console.log(str)
	}
}

function debugRejectLog() {
	if (DEBUG) {
		console.log('QReject - Arguments: \n'+arguments.join(' \n'))
	}
}

// --- UPDATES ----------------------------------------------- //

var barchartsCallID = -1
function updateBarCharts(name, dontWait) {
	debugLog('Update Barcharts')
  var defer = Q.defer()
	var delay = (barchartsCallID >= 0 && !dontWait) ? UPDATE_DELAY * 1000 : 500
	setTimeout(function(myID){
		// Check ID
		if (myID == barchartsCallID) {
			// Lock actions while loading
			if (requestLock()) {
				if (!name || name == "year") {
					// Loads new data, reloads bar chart and releases lock
					updateMonthsWeeks(selectedYears, selectedMonths)
						.then(function(){
							releaseLock()
							defer.resolve()
						}, debugRejectLog)
				} else if (name == "month") {
					// Loads new data, reloads bar chart and releases lock
					updateWeeks(selectedYears, selectedMonths)
						.then(function(){
							releaseLock()
							defer.resolve()
						}, debugRejectLog)
				} else { // if (name == "week") {
					// No bar chart changes
					releaseLock()
					defer.resolve()
				}
			} else {
				debugLog('Barcharts: Couldn\'t request an actions lock')
				defer.reject()
			}
		} else {
			defer.reject()
		}
	}, delay, ++barchartsCallID)
	return defer.promise
}

var heatmapCallID = -1
function updateHeatmap(dontWait) {
	debugLog('Update Heatmap')
  var defer = Q.defer()
	var delay = (heatmapCallID >= 0 && !dontWait) ? UPDATE_DELAY * 1000 : 500
	setTimeout(function(myID){
		// Check ID
		if (myID == heatmapCallID) {
			// Lock actions while loading
			if (requestLock()) {
				years = selectedYears.map(function(index){return yearData[index]['year']})
				months = selectedMonths.map(function(index){return (index+1)+""})
				weeks = selectedWeeks.map(function(index){return (index+1)+""})

				$.ajax({
					type: "POST",
					url: "/getHeatmapData",
					data: {
						"years": years,
						"months": months,
						"weeks": weeks,
						"dayHours": calmapSelection,
						"SouthWest": southWest,
						"NorthEast": northEast
					},
					success: function(data) {
						heatmapCallback(data)
						releaseLock()
						defer.resolve()
					}
				})
			} else {
				debugLog('Heatmap: Couldn\'t request an actions lock')
				defer.reject()
			}
		} else {
			defer.reject()
		}
	}, delay, ++heatmapCallID)
	return defer.promise
}

var calmapCallID = -1
function updateCalmap(dontWait) {
	debugLog('Update Calmap')
  var defer = Q.defer();
	var delay = (calmapCallID >= 0 && !dontWait) ? UPDATE_DELAY * 1000 : 500
	setTimeout(function(myID){
		// Check ID
		if (myID == calmapCallID) {
			// Lock actions while loading
			if (requestLock()) {
				years = selectedYears.map(function(index){return yearData[index]['year']})
				months = selectedMonths.map(function(index){return (index+1)+""})
				weeks = selectedWeeks.map(function(index){return (index+1)+""})

				$.ajax({
					type: "POST",
					url: "/getCalmapData",
					data: {
						"years": years,
						"months": months,
						"weeks": weeks,
						"SouthWest": southWest,
						"NorthEast": northEast
					},
					success: function(data) {
						calmapCallback(data)
						releaseLock()
						defer.resolve()
					}
				})
			} else {
				debugLog('Calmap: Couldn\'t request an actions lock')
				defer.reject()
			}
		} else {
			defer.reject()
		}
	}, delay, ++calmapCallID)
	return defer.promise
}
