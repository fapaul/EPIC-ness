$(function barcharts() {
	var yearData = [{"year": "'10", "average": "9"}, {"year": "'11", "average": "12"}, {"year": "'12", "average": "5"}, {"year": "'13", "average": "7"}]
	displayBarChart(yearData, 'barchart-1')
	
	var monthData = [{"month": "1","average": "2"},{"month": "2","average": "3"},{"month": "3","average": "3"},{"month": "4","average": "6"},{"month": "5","average": "4"},{"month": "6","average": "5"},{"month": "7","average": "5"},{"month": "8","average": "8"},{"month": "9","average": "10"},{"month": "10","average": "5"},{"month": "11","average": "9"},{"month": "12","average": "7"}];
	displayBarChart(monthData, 'barchart-2')
	
	var weekData = [{"week": "1","average": "4"},{"week": "2","average": "3"},{"week": "3","average": "1"},{"week": "4","average": "2"},{"week": "5","average": "1"}];
	displayBarChart(weekData, 'barchart-3')
	
})

function displayBarChart(chartData, divName) {
	var keys = Object.keys(chartData[0]), // First element determines the key names
		name = keys[0],
		value = keys[1],
		div = d3.select('#'+divName),
		margin = {top: 20, right: 20, bottom: 30, left: 30},
		width = div.style('width').substring(0, 3) - margin.left - margin.right, // Removing 'px' suffix
		height = div.style('height').substring(0, 3) - margin.top - margin.bottom
	
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
		.ticks(5, ''); // Only about 5 points at this axis and add a ''

	// Create the svg element in the target container (considering the margin)
	var svg = div.append('svg')
		.attr('width', div.style('width'))
		.attr('height', div.style('height'))
	.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	
	// Define the mark title of x and y axis
	x.domain(chartData.map(function(d) { return d[name]; }))
	var yMax = d3.max(chartData, function(d) { return parseInt(d[value]); })
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
			return d[value];
		})
	
	svg.call(tip);
			
	// Show the chart data as a bar chart (draws a rect object for each entry)
	svg.selectAll('.bar')
		.data(chartData)
	.enter().append('rect')
		.attr('class', 'bar')
		.attr('x', function(d) { return x(d[name])})
		.attr('width', x.rangeBand())
		.attr('y', function(d) { return y(d[value])})
		.attr('height', function(d) { return height - y(d[value]) }) // 50 px distance to top border
		.attr("fill", "#88F") // fill with specific color
		.on("click", function(d) {
			if (!d['clicked']) {
				d['clicked'] = true;
				d3.select(this).classed("highlight", true);
			} else {
				d['clicked'] = false;
				d3.select(this).classed("highlight", false);
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