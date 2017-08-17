var margin = { top: 50, right: 25, bottom: 50, left: 25 },
    outerWidth = 1050,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

var xCat = "x",
    yCat = "y",
    rCat = "rad",
    colorCat = "Manufacturer";

var alldata = {};
var topn = 10;

document.getElementById('topn').innerHTML = topn;

d3.csv("ofile.csv", function(data) {
  data.forEach(function(d) {
    d.x = +d.x;
    d.y = +d.y;
    d['rad'] = 1;

    alldata[d['Serial ID']] = d;
  });

  var xMax = d3.max(data, function(d) { return d[xCat]; }) * 1.05,
      xMin = d3.min(data, function(d) { return d[xCat]; }),
      xMin = xMin > 0 ? 0 : xMin,
      yMax = d3.max(data, function(d) { return d[yCat]; }) * 1.05,
      yMin = d3.min(data, function(d) { return d[yCat]; }),
      yMin = yMin > 0 ? 0 : yMin;

  x.domain([xMin, xMax]);
  y.domain([yMin, yMax]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(-height);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(-width);

  var color = d3.scale.category10();

  var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d) {
        return "GJ ID: " + d["Serial ID"] + "<br><div class='smallbox'>" + d["Sentence"] + "</div>";
      });

  
  var sqeucdist = function(x, y){
    return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2);
  }

  // this is what happens when a circle is clicked
  var circleclick = function(){
    console.log(this);
    var sid = this.getAttribute("data-serial");
    var html = "<h3>Top " + topn + " most similar.<br/>" + alldata[sid]["Sentence"] + "</h3>";

    // find the most similar
    var most_similar = Object.keys(alldata).sort(function(x, y){
      var dx = sqeucdist([alldata[sid].x, alldata[sid].y], [alldata[x].x, alldata[x].y]);
      var dy = sqeucdist([alldata[sid].x, alldata[sid].y], [alldata[y].x, alldata[y].y]);
      return dx - dy;
    });

    html += "<ol>";
    // skip the first, it's the same one.
    for(var i = 1; i <= topn; i++){
      html += "<li>" + alldata[most_similar[i]]['Sentence'] + "</li>";
    }
    html += "</ol>";

    

    document.getElementById("most-similar").innerHTML = html;
  };

  var zoomBeh = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([0, 500])
      .on("zoom", zoom);

  var svg = d3.select("#scatter")
    .append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoomBeh);

  svg.call(tip);

  svg.append("rect")
      .attr("width", width)
      .attr("height", height);

  svg.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width)
      .attr("y", margin.bottom - 10)
      .style("text-anchor", "end")
      .text(xCat);

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yCat);

  var objects = svg.append("svg")
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);

  objects.append("svg:line")
      .classed("axisLine hAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("transform", "translate(0," + height + ")");

  objects.append("svg:line")
      .classed("axisLine vAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

  objects.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .classed("dot", true)
      .attr("r", function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); })
      .attr("transform", transform)
      .attr("data-serial", function(d){ return d['Serial ID']; })
      .style("fill", function(d) { return color(d[colorCat]); })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .on("click", circleclick);

  // var legend = svg.selectAll(".legend")
  //     .data(color.domain())
  //   .enter().append("g")
  //     .classed("legend", true)
  //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // legend.append("circle")
  //     .attr("r", 3.5)
  //     .attr("cx", width + 20)
  //     .attr("fill", color);

  // legend.append("text")
  //     .attr("x", width + 26)
  //     .attr("dy", ".35em")
  //     .text(function(d) { return d; });

  // d3.select("input").on("click", change);

  // function change() {
  //   xCat = "Carbs";
  //   xMax = d3.max(data, function(d) { return d[xCat]; });
  //   xMin = d3.min(data, function(d) { return d[xCat]; });

  //   zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

  //   var svg = d3.select("#scatter").transition();

  //   svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);

  //   objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
  // }

  function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll(".dot")
        .attr("transform", transform);
  }

  function transform(d) {
    return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
  }

});
