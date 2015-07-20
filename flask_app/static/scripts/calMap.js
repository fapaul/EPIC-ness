var cal
var mouseDown = false
var mouseStartPos = null
var cells = []

function displayCalmap(){
	cal = new CalHeatMap();
	cal.init({
		weekStartonMonday: true,
		domain: "day",
		subdomain: "x_hour",
		cellSize: 30,
		data: null,
		start: new Date(2000, 0, 3, 6),
		browsing: true,
		range: 7,
		colLimit: 24,
		domainMargin: [0, 0, 0 , 20],
		verticalOrientation: true,
		subDomainTextFormat: '%H',
		domainLabelFormat: "%A",
		domainGutter: 10,
		legendHorizontalPosition: "center",
		legend: [200, 5000, 10000, 30000, 50000, 100000],
		considerMissingDataAsZero: true,
		label: {
			position: "left",
			width: 46,
		},
		afterLoad: function() {
			// Get all calmap cells with coordinates and date
			storeCalmapCells()

			// Implement drawing a selection area
			d3.select('svg.cal-heatmap-container').append('svg:rect')
				.classed('mouseListener', true)
				.on('mousedown', startSelection)
				.on('mousemove', moveSelection)
				.on('mouseup', endSelection)
				.on('mouseout', endSelection)
		}
	})
}

function disableCalmapControl() {
	$('#cal-heatmap').css('opacity', 0.5)
}

function enableCalmapControl() {
	$('#cal-heatmap').css('opacity', 1)
}

function regenerateCalmap(calmapData) {
	var changedData = JSON.parse(calmapData)
	cal.update(changedData)
	cal.options.data = changedData

	calmapDoneLoading = true;
}

// --- Selection -------------------------------------------------------------//

/*
	TODO:
	1.) Remove onClick-Listener from calmap init function
	2.) Add mouseDown- and mouseUp-Listener
			- for each calmap element or
			- for the whole svg element using the relevant mouse
				coordinates for selecting the right calmap element
	3.) Remove calmap array -> Send origin and extent positions
	4.) Change query using origin and extent
*/

function storeCalmapCells() {
	d3.select('svg.cal-heatmap-container').selectAll('svg.graph-domain').each(
		function(d,i){
			var y = d3.select(this).attr('y')
			d3.select(this).selectAll('g').each(function(){
				var x = d3.select(this).select('rect').attr('x')
				var dateStr = d3.select(this).select('title').html()
				var hourDayRegex = /([0-9]+)h[^0-9]*([3-9])/g
				var match = hourDayRegex.exec(dateStr)
				if (match != null) {
					var hour = match[1]
					var day = match[2]
					cells.push({
						'x': parseInt(x),
						'y': parseInt(y),
						'gElem': d3.select(this),
						'day': parseInt(day),
						'hour': parseInt(hour)
					})
				} else {
					console.log('regex failed on:', dateStr)
				}
			})
		})
}

function startSelection() {
	if (!isLocked()) {
		var p = d3.mouse(this)
		mouseDown = true
		mouseStartPos = p
		d3.select('svg.cal-heatmap-container').append("rect")
			.attr({
					rx: 6,
					ry: 6,
					class: "selection",
					x: p[0],
					y: p[1],
					width: 0,
					height: 0
			})
	}
}

function moveSelection() {
	if (mouseDown) {
		var s = d3.select('svg.cal-heatmap-container').select("rect.selection")
		if (isLocked()) {
			if (s) s.remove()
			mouseDown = false
		} else {
			var p = d3.mouse(this),
					d = {
							x: parseInt(s.attr("x")),
							y: parseInt(s.attr("y")),
							width: parseInt(s.attr("width")),
							height: parseInt(s.attr("height"))
					},
					move = {
							x: p[0] - mouseStartPos[0],
							y: p[1] - mouseStartPos[1]
					}
			;

			if(move.x <= 0) {
				d.x = p[0];
				d.width = -move.x;
			} else {
				d.x = mouseStartPos[0]
				d.width = move.x;
			}
			if (move.y <= 0) {
				d.y = p[1]
				d.height = -move.y
			} else {
				d.y = mouseStartPos[1]
				d.height = move.y
			}
			s.attr(d)
			// highlightCells(d) // FIXME: Laggt zu hart
		}
	}
}

function endSelection() {
	if (mouseDown) {
		selector = d3.select('svg.cal-heatmap-container').select("rect.selection")
		if (isLocked()) {
			cal.hightlight("now")
		} else {
			d = {
					x: parseInt(selector.attr("x")),
					y: parseInt(selector.attr("y")),
					width: parseInt(selector.attr("width")),
					height: parseInt(selector.attr("height"))
			}
			selCells = highlightCells(d)
			for (var i = 0; i < selCells.length; i++) {
				selCells[i] = [selCells[i].getDay(), selCells[i].getHours()]
			}
			setCalmapSelection(selCells)
		}
		if (selector) selector.remove()
		mouseDown = false
	}
}

function highlightCells(d) {
	selCells = []
	for(var i = 0; i < cells.length; i++) {
		cell = cells[i]
		if (rectsIntersect([[cell.x, cell.y], [cell.x+30, cell.y+30]], [[d.x-66, d.y], [d.x+d.width-66, d.y+d.height]])) {
			selCells.push(new Date(2000, 0, cell.day, cell.hour))
			cell.gElem.select('text').style('font-weight', 'bold')
			cell.gElem.style('opacity', '1')
		} else {
			cell.gElem.select('text').style('font-weight', 'normal')
			cell.gElem.style('opacity', '0.6')
		}
	}
	cal.highlight(selCells)
	return selCells
}

// http://stackoverflow.com/questions/16005136/how-do-i-see-if-two-rectangles-intersect-in-javascript-or-pseudocode
function rectsIntersect(rect1, rect2) {
    /*
     * Each array in parameter is one rectangle
     * in each array, there is an array showing the co-ordinates of two opposite corners of the rectangle
     * Example:
     * [[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]
     */

    //Check whether there is an x overlap
    if ((rect1[0][0] < rect2[0][0] && rect2[0][0] < rect1[1][0]) //Event that x3 is inbetween x1 and x2
        || (rect1[0][0] < rect2[1][0] && rect2[1][0] < rect1[1][0]) //Event that x4 is inbetween x1 and x2
        || (rect2[0][0] < rect1[0][0] && rect1[1][0] < rect2[1][0])) {  //Event that x1 and x2 are inbetween x3 and x4
        //Check whether there is a y overlap using the same procedure
        if ((rect1[0][1] < rect2[0][1] && rect2[0][1] < rect1[1][1]) //Event that y3 is between y1 and y2
            || (rect1[0][1] < rect2[1][1] && rect2[1][1] < rect1[1][1]) //Event that y4 is between y1 and y2
            || (rect2[0][1] < rect1[0][1] && rect1[1][1] < rect2[1][1])) { //Event that y1 and y2 are between y3 and y4
            return true;
        }
    }
    return false;
}
