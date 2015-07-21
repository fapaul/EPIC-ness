function displayBarChart(chartData, divName) {
	var keys = Object.keys(chartData[0]), // First element determines the key names
		name = keys[0],
		value = keys[1],
		div = d3.select('#'+divName),
		margin = {top: 20, right: 20, bottom: 30, left: 30},
		width = div.style('width').substring(0, 3) - margin.left - margin.right, // Removing 'px' suffix
		height = div.style('height').substring(0, 3) - margin.top - margin.bottom

	// Prepare chartData
	for(var i = 0; i < chartData.length; i++) {
		chartData[i]['clicked'] = false
		chartData[i]['index'] = i
	}

	// Defines the Space for the x axis and the distance between the axis marks
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1)

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom')

	// Defines the Space for the y axis
	var y = d3.scale.linear()
		.range([height, 0]);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left')
		.ticks(5, '') // Only about 5 points at this axis and add a ''
		.tickFormat(''); // No text labels (to less space for big numbers)

	// Create the svg element in the target container (considering the margin)
	var svg = div.append('svg')
		.attr('id', name+'SVG')
		.attr('width', div.style('width'))
		.attr('height', div.style('height'))
	.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	// Define the mark title of x and y axis
	x.domain(chartData.map(function(d) { return shortenBarName(d[name]) }))
	var yMax = d3.max(chartData, function(d) { return parseInt(d[value]) })
	y.domain([0, yMax + 0.1 * yMax]) // Adding 10% to get more space to the top border

	// Add x axis to the display
	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(xAxis)

	// Add y axis to the display (including a title)
	svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
	.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		// .text(value.charAt(0).toUpperCase() + value.slice(1)) // Add axis title

	// Generate tooltip
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			// Use intToReadableString for adding thousand markers
			return parseFloat(d[value]).toFixed(3);
		})

	svg.call(tip);

	// Show the chart data as a bar chart (draws a rect object for each entry)
	var i = 0
	svg.selectAll('.bar')
		.data(chartData)
	.enter().append('rect')
		.attr('class', 'bar')
		.attr('class', name+'Bar')
		.attr('id', function(d) { i += 1; return i - 1}) // Enumerate bars
			// Same name translation as in the beginning (otherwise format error)
		.attr('x', function(d) { return x(shortenBarName(d[name]))})
		.attr('width', x.rangeBand())
		.attr('y', function(d) { return y(d[value])})
		.attr('height', function(d) { return height - y(d[value]) }) // 50 px distance to top border
		.attr("fill", "#88F") // fill with specific color
		.on("click", function(d) {
			// TODO: Visualize locking (loading gif, gray layer, bottom note, etc.)
			// TODO: Export this function to barcharts.js
			if (!isLocked()) {
				if (!d['clicked']) {
					d['clicked'] = true;
					d3.select(this).classed("highlight", true);
					changeBarchartSelection(d);
				} else {
					d['clicked'] = false;
					d3.select(this).classed("highlight", false);
					changeBarchartSelection(d);
				}
			}
		})
		.on("mouseover", function(d) {
			if (!d['clicked']) {
				d3.select(this).classed("highlight", true);
			}
			tip.show(d)
		})
		.on("mouseout", function(d) {
			if (!d['clicked']) {
				d3.select(this).classed("highlight", false);
			}
			tip.hide(d)
		});
}

function intToReadableString(intVal) {
	var val = intVal+""
	var initialLength = val.length
	// Add points marking steps of thousands (e.g. "12.345.678")
	for(j = 1; j < initialLength; j++) {
		if (j % 3 == 0) {
			val = val.substring(0, initialLength - j) + '.' + val.substring(initialLength -j, val.length)
		}
	}
	return val
}

function shortenBarName(name) {
	return (name.length > 3) ? "'"+name.substring(2, 4) : name;
}

function displayDonutChart(chartData, divName) {
	var keys = Object.keys(chartData[0]),
		name = keys[0],
		value = keys[1],
		pieData = [],
		div = d3.select('#'+divName),
		width = div.style('width').substring(0, 3), // Removing 'px' suffix
		height = div.style('height').substring(0, 3)
	// Convert chartData into the right format
	for (var rowNum in chartData) {
		pieData.push({label: chartData[rowNum][name], value: chartData[rowNum][value]})
	}

	// Generate pie chart -> For more information: http://d3pie.org/#examples
	var pie = new d3pie(divName, {
		/*header: {
			title: {
				text: "A very simple example pie"
			}
		},*/
		data: {
			content: pieData
		},
		size: {
			pieInnerRadius: "80%",
			canvasWidth: width,
			canvasHeight: height
		}
	})
}
