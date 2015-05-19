function displayBarChart(chartData, divName) {
	var keys = Object.keys(chartData[0]), // First element determines the key names
		name = keys[0],
		value = keys[1],
		div = d3.select('#'+divName),
		margin = {top: 20, right: 20, bottom: 30, left: 70},
		width = div.style('width').substring(0, 3) - margin.left - margin.right, // Removing 'px' suffix
		height = div.style('height').substring(0, 3) - margin.top - margin.bottom
	
		console.log('Data', chartData);
		console.log('Schlüsselname', name);
		console.log('Wertname', value);
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
		// .ticks(10, '%'); // Scale mark values with 10 and add a '%'

	// Create the svg element in the target container (considering the margin)
	var svg = div.append('svg')
		.attr('width', div.style('width'))
		.attr('height', div.style('height'))
	.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	
	// Define the mark title of x and y axis
	x.domain(chartData.map(function(d) { return d[name]; }))
	var yMax = d3.max(chartData, function(d) { return d[value]; })
	y.domain([0, yMax + yMax * 0.1]) // Adding 10% to get more space to the top border

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
		.text(value.charAt(0).toUpperCase() + value.slice(1))

	// Show the chart data as a bar chart (draws a rect object for each entry)
	svg.selectAll('.bar')
		.data(chartData)
	.enter().append('rect')
		.attr('class', 'bar')
		.attr('x', function(d) { return x(d[name])})
		.attr('width', x.rangeBand())
		.attr('y', function(d) { return y(d[value])})
		.attr('height', function(d) { return height - y(d[value]) }) // 50 px distance to top border
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