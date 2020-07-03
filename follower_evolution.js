<!DOCTYPE html>
<title>Follower evolution</title>
<meta charset="utf-8">
<style> /* set the CSS */
  
  body { font: 12px Arial;}
  
	.axis { font: 14px sans-serif; }

	.line {
    fill: none;
    stroke: steelblue;
    stroke-width: 2px;
	}
  
  .hidden {
        display: none;
  }
  
  .dot {
        fill: #ffbb0f;
  }
  
  .dot_onMouse {
        fill: #2900c1;
  }
  
  div.tooltip {
    color: #222; 
    background: #fff; 
    border-radius: 3px; 
    box-shadow: 0px 0px 2px 0px #a6a6a6; 
    padding: 5em; 
    text-shadow: #f5f5f5 0 1px 0;
    opacity: 2.84; 
    position: absolute;
  }

</style>
<body>

  <!-- load the d3.js library -->    	
  <script src="https://d3js.org/d3.v4.min.js"></script>
  
  <!-- Initialize a select button -->
	<select id="selectButton"></select>
  
  <!-- Create a div where the graph will take place -->
	<div id="my_dataviz"></div>
  
  <script>

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 30, bottom: 100, left: 100},
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%Y-%m-%d"),
    formatTime = d3.timeFormat("%e %B"),
    getYear = d3.timeFormat("%Y"),
    getDay = d3.timeFormat("%d"),
    getMonth = d3.timeFormat("%m"),
    getMonthNom = d3.timeFormat("%B"),
    getYear = d3.timeFormat("%Y");
    
    function daysInMonth (month, year) {
      return new Date(year, month, 0).getDate();}
    
    
    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#my_dataviz")
    	.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    
    // Define the div for the tooltip (pop up)
    var tooltip = d3.select('body')
    	.append('div')
    	.attr('class', 'hidden tooltip')
    	.attr('style', 'left:' + 300 +
                                'px; top:' + 150 + 'px')
	    .text("Undefined");
    
    // set the ranges
    // X is a date format
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    
    // Define the axes
    var xAxis = d3.axisBottom(x).ticks(10)
    var yAxis = d3.axisLeft(y);
      
    // Read the data   
    d3.csv("followers_evolution.csv", function(error, data) {
      if (error) throw error;
      
      // List of groups (here I have one group per column) - static temporaire
    	var allGroup = ["January","February", "March", "April",
                   		"May","June","July","August",
                      "September","October","November","December" ]
      
      var defaultOptionName = "June"; // desired default dropdown name
      
      // add the options to the button
      d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { 
        	return d; }) // corresponding value returned by the button
        .property("selected", function(d){ return d === defaultOptionName; })
      
			// Add the line path
      var line = svg.append("path").attr("class", "line")
      
      // Add the X Axis
      var xAxisGroup = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
      		.call(xAxis)
          .selectAll("text")
      			.style("text-anchor", "end")
    				.attr("dx", "-.8em")
    				.attr("dy", ".15em")
    				.attr("transform", "rotate(-65)");
      
      // Add the Y Axis
      var yAxisGroup = svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
      
      // Add a label to the y axis
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 90)
        .attr("x", 0 -(height/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Follower numbers")
        .attr("class", "y axis label");
      
      // A function that update the chart
      function update(selectedGroup) {
        
        // Create new data with the selection?
        // filter data by year and month
        var dataFilter = data.filter(function(d){
          d.dateTime = parseTime(d.day)
          return getYear(d.dateTime) == '2020' 
            && getMonthNom(d.dateTime) == selectedGroup ;});
        
        // Check if data is empty
        if (dataFilter === undefined || dataFilter.length == 0) {
          // message appear in console
					alert("Data unavailable!");
          
          // Visualiser le toolip
          tooltip.classed('hidden', false)
            .text("Unvailable data on " + selectedGroup);
          
          // Hide line path
          line.classed('hidden', true);
          svg.select(".x.axis").classed('hidden', true);
          svg.select(".y.axis").classed('hidden', true);
          svg.select(".y.axis.label").classed('hidden', true);      
        	svg.selectAll(".dot").remove();
          
          return ;
        }
        else {
          // Hide le toolip
          tooltip.classed('hidden', true)
            .text("Unvailable data on " + selectedGroup);
          line.classed('hidden', false);
          svg.select(".x.axis").classed('hidden', false);
          svg.select(".y.axis").classed('hidden', false);
          svg.select(".y.axis.label").classed('hidden', false);

        };
        
        // Scale the range of the data
        // X returns the minimum and maximum value in an array from the month given 
        x.domain(d3.extent(dataFilter, function(d) { return d.dateTime;})).nice();
        y.domain([d3.min(dataFilter, function(d) { return d.followers; }), 
                  d3.max(dataFilter, function(d) { return d.followers; })]).nice();
        
        // Add the valueline path.
        line.datum(dataFilter)
          .transition().duration(500)
          .attr("d", d3.line()
                .x(function(d) { return x(+d.dateTime) })
                .y(function(d) { return y(+d.followers) })
               );
        
        //Updates xAxis, yAxis
        svg.select(".x.axis").call(xAxis)
          .transition().duration(500);
        svg.select(".y.axis").call(yAxis)
          .transition().duration(500);
        
        // Add the dot
        svg.selectAll(".dot").remove();
        svg.selectAll(".dot")
          .data(dataFilter).enter().append("circle")
          .transition().duration(100)
          .attr("class", "dot")
          .attr("r", 5)
          .attr("cx", function(d) { return x(d.dateTime); })
          .attr("cy", function(d) { return y(d.followers); })
        ;
      }
      
      // When the button is changed, run the updateChart function
      d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        
        // run the updateChart function with this selected option
        update(selectedOption)
      })
      
      // Initialize line with group defaultOptionName
      update(defaultOptionName)
    });

  </script>
</body>
