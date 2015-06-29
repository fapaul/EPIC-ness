
// --- OBSERVER ---------------------------------------------- //

// TODO: Wait after input for 2 seconds before loading data
// TODO: Visualize locking (loading gif, gray layer, bottom note, etc.)
// TODO: Write initObserver calling initHeatmap, initCalHeatmap, initBarcharts
function updateObserver(barData) {
	// 1.) Update Barcharts (abhängig vom angeklickten Diagramm)
	updateBarCharts(barData);
	// 2.) Update Heatmap
	updateHeatmap();
	// 3.) Update Calmap
	//updateCalmap();
}

var locked = false
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

// --- BARCHARTS --------------------------------------------- //
// Dummy data (overwritten by hardcoded data in backend by reloading)
var yearData = [{"year": "2010", "value": "9"}, {"year": "2011", "value": "12"},
			{"year": "2012", "value": "5"}, {"year": "2013", "value": "7"}],
	monthData = [{"month": "1","value": "2"},{"month": "2","value": "3"},
			{"month": "3","value": "3"},{"month": "4","value": "6"},
			{"month": "5","value": "4"},{"month": "6","value": "5"},
			{"month": "7","value": "5"},{"month": "8","value": "8"},
			{"month": "9","value": "10"},{"month": "10","value": "5"},
			{"month": "11","value": "9"},{"month": "12","value": "7"}],
	weekData = [{"week": "1","value": "4"},{"week": "2","value": "3"},
		{"week": "3","value": "1"},{"week": "4","value": "2"},{"week": "5","value": "1"}]

	var selectedYears = [1],
		selectedMonths = [0, 1],
		selectedWeeks = [1, 4]
// Called when document is loaded -> Generate bar charts with dummy data
$(function loadData() {
	years = selectedYears.map(function(index){return yearData[index]['year']})
	months = selectedMonths.map(function(index){return monthData[index]['month']})
	$.ajax({
		type: "POST",
		url: "/getYearsCount",
		data: {"years[]": years, "months[]": months},
		success: receiveData
	})
})

function receiveData(data) {
	data = JSON.parse(data)
	newYearsData = data['years']
	newMonthsData = data['months']
	newWeeksData = data['weeks']
	for(var i = 0; i < yearData.length; i++) {
		yearData[i]['value'] = newYearsData[i]+""
	}
	for(var i = 0; i < monthData.length; i++) {
		monthData[i]['value'] = newMonthsData[i]+""
	}
	for(var i = 0; i < weekData.length; i++) {
		weekData[i]['value'] = newWeeksData[i]+""
	}

	displayBarChart(yearData, 'barchart-1')
	displayBarChart(monthData, 'barchart-2')
	displayBarChart(weekData, 'barchart-3')
	updateSelectionView()
}

function updateSelectionView() {
	d3.selectAll('.yearBar').each(function(d){
		d['clicked'] = selectedYears.indexOf(d['index']) != -1
		d3.select(this).classed('highlight', d['clicked'])
	})
	d3.selectAll('.monthBar').each(function(d){
		d['clicked'] = selectedMonths.indexOf(d['index']) != -1
		d3.select(this).classed('highlight', d['clicked'])
	})
	d3.selectAll('.weekBar').each(function(d){
		d['clicked'] = selectedWeeks.indexOf(d['index']) != -1
		d3.select(this).classed('highlight', d['clicked'])
	})
}

// TODO(2): Nicht unbedingt alles neuladen (nur was nötig ist)
function regenerateBarCharts() {
	d3.selectAll('.d3-tip').remove()
	d3.select('#yearSVG').remove()
	displayBarChart(yearData, 'barchart-1')
	d3.select('#monthSVG').remove()
	displayBarChart(monthData, 'barchart-2')
	d3.select('#weekSVG').remove()
	displayBarChart(weekData, 'barchart-3')

	updateSelectionView()
}

function updateBarCharts(barData) {
	var name = "year"
	if (barData != null) {
		name = Object.keys(barData)[0] // key name: "year", "month" or "week"
	}

	if (name == "year") {
		if (barData != null) {
			if (barData['clicked']) {
				selectedYears.push(barData['index'])
			} else {
				selectedYears.splice(selectedYears.indexOf(barData['index']),1)
			}
		}
		// Loads new data, reloads bar chart and releases lock
		updateMonthsWeeks(selectedYears, selectedMonths)
	} else if (name == "month") {
		if (barData != null) {
			if (barData['clicked']) {
				selectedMonths.push(barData['index'])
			} else {
				selectedMonths.splice(selectedMonths.indexOf(barData['index']),1)
			}
		}
		// Loads new data, reloads bar chart and releases lock
		updateWeeks(selectedYears, selectedMonths)
	} else if (name == "week") {
		if (barData != null) {
			if (barData['clicked']) {
				selectedWeeks.push(barData['index'])
			} else {
				selectedWeeks.splice(selectedWeeks.indexOf(barData['index']),1)
			}
		}
		releaseLock()
		// No bar chart changes
	}
}

function updateMonthsWeeks(selYears, selMonths) {
	// TODO(4): Export mapping to external function (because of several uses)
	years = selYears.map(function(index){return yearData[index]['year']})
	months = selMonths.map(function(index){return monthData[index]['month']})
	$.ajax({
		type: "POST",
		url: "/getMonthsCount",
		data: {"years[]": years, "months[]": months},
		success: receiveMonthsWeeksData
	})
}

function receiveMonthsWeeksData(data) {
	data = JSON.parse(data)
	newMonthsData = data['months']
	newWeeksData = data['weeks']
	for(var i = 0; i < monthData.length; i++) {
		monthData[i]['value'] = newMonthsData[i]+""
	}
	for(var i = 0; i < weekData.length; i++) {
		weekData[i]['value'] = newWeeksData[i]+""
	}
	regenerateBarCharts()
	releaseLock()
}

function updateWeeks(selYears, selMonths) {
	years = selYears.map(function(index){return yearData[index]['year']})
	months = selMonths.map(function(index){return monthData[index]['month']})
	$.ajax({
		type: "POST",
		url: "/getWeeksCount",
		data: {"years[]": years, "months[]": months},
		success: receiveWeeksData
	})
}

function receiveWeeksData(newWeeksData) {
	newWeeksData = JSON.parse(newWeeksData)
	for(var i = 0; i < weekData.length; i++) {
		weekData[i]['value'] = newWeeksData[i]+""
	}
	regenerateBarCharts()
	releaseLock()
}

// --- UPDATES ----------------------------------------------- //

// query = "SELECT TRIP.PICKUP_LAT AS LatC, TRIP.PICKUP_LONG AS LongC FROM NYCCAB.TRIP_DOUBLE AS TRIP WHERE TRIP.PICKUP_LAT <> 0 AND TRIP.PICKUP_LONG <> 0 ORDER BY TRIP.RATE DESC LIMIT 100"
function updateHeatmap() {
	// TODO(3): Use real data
	// TODO(3): Implement using real data
	years = selectedYears.map(function(index){return yearData['index']})
	months = selectedMonths.map(function(index){return monthData['index']})
	weeks = selectedWeeks.map(function(index){return weekData['index']})

	$.ajax({
		type: "POST",
		url: "/heatmap",
		data: {
			"years": years,
			"months": months,
			"weeks": weeks
		},
		success: heatMapCallback
	})
}

function updateCalMap(southWest, northEast) {
	// TODO(2): Implement update function and dummy data for testing
	// (Query needs too much time -> can't reload webpage quickly)
	changeData(southWest, northEast)

}
