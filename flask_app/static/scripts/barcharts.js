
function initBarcharts() {
	barchartsCallback(JSON.stringify({
		'years': [0,0,0,0],
		'months': [0,0,0,0,0,0,0,0,0,0,0,0],
		'weeks': [0,0,0,0,0]
	}))
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

function loadBarchartsData() {
	var defer = Q.defer()
	years = selectedYears.map(function(index){return yearData[index]['year']})
	months = selectedMonths.map(function(index){return (index+1)+""})
	$.ajax({
		type: "POST",
		url: "/getYearsCount",
		data: {"years[]": years, "months[]": months},
		success: function(data) {
			barchartsCallback(data)
			defer.resolve()
		}
	})
	return defer.promise
}

function barchartsCallback(data) {
	data = JSON.parse(data)
	newYearsData = data['years']
	newMonthsData = data['months']
	newWeeksData = data['weeks']

	yearData = []
	monthData = []
	weekData = []
	for(var i = 0; i < newYearsData.length; i++) {
		yearData.push({"year": (2010+i)+"", "value": newYearsData[i]+""})
	}
	for(var i = 0; i < newMonthsData.length; i++) {
		monthData.push({"month": (1+i)+"", "value": newMonthsData[i]+""})
	}
	for(var i = 0; i < newWeeksData.length; i++) {
		weekData.push({"week": (1+i)+"", "value": newWeeksData[i]+""})
	}
	regenerateBarCharts()
}

function updateMonthsWeeks(selYears, selMonths) {
	var defer = Q.defer()
	// TODO(4): Export mapping to external function (because of several uses)
	years = selYears.map(function(index){return yearData[index]['year']})
	months = selMonths.map(function(index){return monthData[index]['month']})
	$.ajax({
		type: "POST",
		url: "/getMonthsCount",
		data: {"years[]": years, "months[]": months},
		success: function(data) {
			receiveMonthsWeeksData(data)
			defer.resolve()
		}
	})
	return defer.promise
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
}

function updateWeeks(selYears, selMonths) {
	var defer = Q.defer()
	years = selYears.map(function(index){return yearData[index]['year']})
	months = selMonths.map(function(index){return monthData[index]['month']})
	$.ajax({
		type: "POST",
		url: "/getWeeksCount",
		data: {"years[]": years, "months[]": months},
		success: function(data) {
			receiveWeeksData(data)
			defer.resolve()
		}
	})
	return defer.promise
}

function receiveWeeksData(newWeeksData) {
	newWeeksData = JSON.parse(newWeeksData)
	for(var i = 0; i < weekData.length; i++) {
		weekData[i]['value'] = newWeeksData[i]+""
	}
	regenerateBarCharts()
}
