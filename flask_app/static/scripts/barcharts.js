
function initBarcharts() {
	receiveYearsData(JSON.stringify([0,0,0,0]))
	receiveMonthsData(JSON.stringify([0,0,0,0,0,0,0,0,0,0,0,0]))
	receiveWeeksData(JSON.stringify([0,0,0,0,0]))
	regenerateBarCharts()
}

function disableBarchartsControl() {
	$('#barchart-1').css('opacity', 0.5)
	$('#barchart-2').css('opacity', 0.5)
	$('#barchart-3').css('opacity', 0.5)
}

function enableBarchartsControl() {
	$('#barchart-1').css('opacity', 1)
	$('#barchart-2').css('opacity', 1)
	$('#barchart-3').css('opacity', 1)
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

// A bar has been clicked -> add to / remove from its array
// name: "year", "month" or "week"
function handleNewBarElement(barData, name) {
	if (!name || name == "year") {
		if (barData['clicked']) {
			selectedYears.push(barData['index'])
		} else {
			selectedYears.splice(selectedYears.indexOf(barData['index']),1)
		}
	} else if (name == "month") {
		if (barData['clicked']) {
			selectedMonths.push(barData['index'])
		} else {
			selectedMonths.splice(selectedMonths.indexOf(barData['index']),1)
		}
	} else if (name == "week") {
		if (barData['clicked']) {
			selectedWeeks.push(barData['index'])
		} else {
			selectedWeeks.splice(selectedWeeks.indexOf(barData['index']),1)
		}
	}
}

// --- Ajax Updates & Callbacks --------------------------------------------- //

function updateYears() {
	var defer = Q.defer()
	$.ajax({
		type: "POST",
		url: "/getYearsCount",
		data: {},
		success: function(data) {
			receiveYearsData(data)
			defer.resolve()
		},
		error: defer.reject
	})
	return defer.promise
}

function receiveYearsData(newYearsData) {
	newYearsData = JSON.parse(newYearsData)
	for(var i = 0; i < yearData.length; i++) {
		yearData[i]['value'] = newYearsData[i]+""
	}
}

function updateMonths(selYears) {
	var defer = Q.defer()
	// TODO(4): Export mapping to external function (because of several uses)
	years = selYears.map(function(index){return (2010+index)+""})
	$.ajax({
		type: "POST",
		url: "/getMonthsCount",
		data: {"years[]": years},
		success: function(data) {
			receiveMonthsData(data)
			defer.resolve()
		},
		error: defer.reject
	})
	return defer.promise
}

function receiveMonthsData(newMonthsData) {
	newMonthsData = JSON.parse(newMonthsData)
	for(var i = 0; i < monthData.length; i++) {
		monthData[i]['value'] = newMonthsData[i]+""
	}
}

function updateWeeks(selYears, selMonths) {
	var defer = Q.defer()
	years = selYears.map(function(index){return (2010+index)+""})
	months = selMonths.map(function(index){return (1+index)+""})
	$.ajax({
		type: "POST",
		url: "/getWeeksCount",
		data: {"years[]": years, "months[]": months},
		success: function(data) {
			receiveWeeksData(data)
			defer.resolve()
		},
		error: defer.reject
	})
	return defer.promise
}

function receiveWeeksData(newWeeksData) {
	newWeeksData = JSON.parse(newWeeksData)
	for(var i = 0; i < weekData.length; i++) {
		weekData[i]['value'] = newWeeksData[i]+""
	}
}
