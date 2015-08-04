var UPDATE_DELAY = 3 // Seconds (waiting after input)
var DEBUG = false

var yearData = [{'year': '2010'}, {'year': '2011'}, {'year': '2012'}, {'year': '2013'}],
	monthData = [{'month': 1}],
	weekData = [{'week': 1}]

var selectedYears = [1],
		selectedMonths = [0, 1],
		selectedWeeks = [1, 4]

var northEast,
	southWest,
	zoomLevel

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
	// Different behavior for each barchart ("year", "moth" or "week")
	var name = (barData != null) ? Object.keys(barData)[0] : "year"

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
function setHeatmapBounds(southWestBound, northEastBound, newZoomLevel) {
	// Check for changes because of multiple calls by the event listener
	if (!southWest || !northEast ||
			southWest.lat != southWestBound.lat || southWest.long != southWestBound.long ||
			northEast.lat != northEastBound.lat || northEast.long != northEastBound.long) {

			// TODO Für Paul: So würde es aussehen für Multithreaded Connections:
			// Wird aber nicht funktionieren, da updateHeatmap und updateCalmaa jeweils 5 Sekunden warten
			// und dann einen Lock Request machen, wobei nur einer den Lock erhält -> Locks verhinden das
			// Multithreading -> Lock Request und Release müssen in die übergeordneten Funktion jeweils
			// ausgelagert werden.
			// Also: Überall wo updateHeatmap, updateCalmap oder updateBarcharst aufgerufen werden den
			// sequentiellen Aufruf über ein Mutex wie hier in Multithreading umwandeln und dabei mit Locks arbeiten.
			// Außerdem sollten Calmap und Barcharts ebenfalls speichern, ob es nötig ist, neuzuladen
			// (Wenn man eine neue Auswahl trifft und dann wieder die alte macht, werden die Daten trotzdem geladen
			// -> Nach dem Timeout selectedYears z.B. mit prevSelectedYears abgleichen)
			/*
			startedThreads = 0
			allThreadsFinished = function() {
				startedThreads--
				if (startedThreads <= 0) {
					releaseLock()
				}
			}
			startedThreads++
			updateHeatmap(false, southWestBound, northEastBound, newZoomLevel).then(allThreadsFinished, debugRejectLog)
			startedThreads++
			updateCalmap(false).then(allThreadsFinished, debugRejectLog)
			if (firstTime) {
				firstTime = false
				startedThreads++
				// Load function only for initialization
				loadBarchartsData().then(allThreadsFinished, debugRejectLog)
			}
			*/

			updateHeatmap(false, southWestBound, northEastBound, newZoomLevel)
			.then(function(){return updateCalmap(true)}, debugRejectLog)
			.then(function(){
				if (firstTime) {
					firstTime = false
					if (requestLock()) {
						// Load only for initialization
						loadBarchartsData().then(releaseLock, debugRejectLog)
					} else {
						debugLog('Loading barcharts failed (cant request lock)')
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
		showLoadingAnimation()
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
		hideLoadingAnimation()
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

function showLoadingAnimation() {
	$('.loadingAnimation').css('display','')
}

function hideLoadingAnimation() {
	$('.loadingAnimation').css('display','none')
}

// --- UPDATES ----------------------------------------------- //

function cancelUpdate() {
	barchartsCallID++
	heatmapCallID++
	calmapCallID++
}

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
function updateHeatmap(dontWait, newSouthWest, newNorthEast, newZoomLevel) {
	debugLog('Update Heatmap')
  var defer = Q.defer()
	var delay = (heatmapCallID >= 0 && !dontWait) ? UPDATE_DELAY * 1000 : 500
	debugLog(newSouthWest, newNorthEast, newZoomLevel)
	if (!newSouthWest || !newNorthEast || newZoomLevel == null) {
		newSouthWest = southWest
		newNorthEast = northEast
		newZoomLevel = zoomLevel
	}

	setTimeout(function(myID, newSouthWest, newNorthEast, newZoomLevel){
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
						"southWest": newSouthWest,
						"northEast": newNorthEast,
						"zoomLevel": newZoomLevel
					},
					success: function(data) {
						regenerateHeatmapLayer(data)
						southWest = {'lat': newSouthWest.lat, 'long': newSouthWest.long}
						northEast = {'lat': newNorthEast.lat, 'long': newNorthEast.long}
						zoomLevel = newZoomLevel
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
	}, delay, ++heatmapCallID, newSouthWest, newNorthEast, newZoomLevel)
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
						"southWest": southWest,
						"northEast": northEast
					},
					success: function(data) {
						regenerateCalmap(data)
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
