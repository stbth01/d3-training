function buildChart(containerId) {
    // size globals
    var width = 1000;
    var height = 700;
    var legendSize = 15;
    var scaleProj = 3600;
    var centerScale = [-84, 44]

    var margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };

    // calculate dimensions without margins
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - (margin.top *2) - margin.bottom;

    // create svg element
    var svg = d3
        .select(containerId)
        .append('svg')
        .attr('height', height)
        .attr('width', width);

    // create inner group element
    var g = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',0)');

    // append all of your chart elements to g

    d3.json('data/us-counties.json', function(error, usJson) {
        handleError(error, 'failed to load usJson data');

        d3.csv('data/count_by_county.csv', function(error, murders) {
            handleError(error, 'failed to load usJson data');

            michJson = usJson.features.filter( (x) =>  +x.id.toString().slice(0, -3) === 26 );

            michJson.forEach((x) => {
                x.properties.murders = murders.filter(i => +i.FIPS === +x.id)
            });
            
            var years = getYears(murders);
            
            draw(michJson, murders, years)
        });
        
    });


    function handleError(error, msg) {
        if (error) {
            console.error(msg);
        }
    }

    function getYears(data) {
        var years = []
            
        data.forEach( e => {
            if(years.indexOf(e.Year)===-1){
                years.push(e.Year)
            }
        });
        return years.sort();
    }


    function draw(geojson, data, years) {

        var colorScheme = ['white', 'blue'];
        var maxValue = d3.max(data, (d)=> +d.Count);
        var missingColor = 'grey';

        var colorScale = d3  //.scaleLinear()
            .scaleLog()
            .domain([1, maxValue])
            .range(colorScheme)
            .clamp(true);

        var legendScale = d3 //.scaleLinear()
            .scaleLog()
            .domain([1, maxValue])
            .range([ 0, innerHeight])
            .clamp(true);

        var albersUsaProj = d3
            .geoMercator()
            //.geoAlbersUsa()
            .scale(scaleProj)
            .center(centerScale)
            .translate([ innerWidth*.75, innerHeight*.7 ]);

        var path = d3.geoPath().projection(albersUsaProj);

        var legendWidth = 15 ;

         // title
        var title = g
         .append('text')
         .attr('class', 'title')
         .attr('x', innerWidth / 2)
         .attr('y', 20)
         .attr('text-anchor', 'middle')
         .attr('dominant-baseline', 'baseline')
         .style('font-size', 24)
         .text('Number of Murders per county in ' + years[0] );




        // slider

        var moving = false;
        var currentValue = 0;
        var targetValue = innerWidth;

        var playButton = d3.select("#play-button");

        var parseTime = d3.timeParse("%Y");
        var formatDateIntoYear = d3.timeFormat("%Y");
            
        var x = d3.scaleTime()
            .domain([parseTime(d3.min(years)), parseTime(d3.max(years))])
            .range([0, targetValue])
            .clamp(true);

        var slider = g.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin.left + "," + + margin.top + ")");

        slider.append("line")
            .attr("class", "track")
            .attr("x1", x.range()[0])
            .attr("x2", x.range()[1])
            .select(function() { 
                return this.parentNode.appendChild(this.cloneNode(true)); 
            })
            .attr("class", "track-inset")
            .select(function() { 
                return this.parentNode.appendChild(this.cloneNode(true)); 
            })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function() { slider.interrupt(); })
                .on("start drag", function() {
                currentValue = d3.event.x;
                update(x.invert(currentValue)); 
                })
            );


        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 10 + ")")
            .selectAll("text")
            .data(x.ticks(10))
            .enter()
            .append("text")
            .attr("x", x)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text(function(d) { return formatDateIntoYear(d); });

        var handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        var label = slider.append("text")  
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(d3.min(years))
            .attr("transform", "translate(0," + (-15) + ")")

        //plot
        var plot = g
            .append('g')
            .attr('transform', 'translate(' + (margin.left +10) + ',' + margin.top * 2 + ')');


        var zeroLegend = plot
            .append('g')

        zeroLegend
          .append('rect')
          .attr('width', legendWidth)
          .attr('height', 10)
          .style('fill', 'grey')
          .style('stroke', 'white')

          
        zeroLegend.append('text')
          .attr('x', legendWidth + 5 )
          .attr('y', legendWidth -5 )
          .text('zero or unknown');

        zeroLegend.append('text')
          .attr('x',  -35 )
          .attr('y', innerHeight/2 )
          .text('Log' );

        zeroLegend.append('text')
          .attr('x',  -39 )
          .attr('y', innerHeight/2 + 11 )
          .text('Scale' );

        var legend = plot
            .append('g')
            .attr('width', legendWidth)
            .attr('height', innerHeight - legendWidth)
            .attr('transform', 'translate(0 ,' + legendWidth + ')');


        var linearGradient = legend
            .append('defs')
            .append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        linearGradient.append('stop')
            .attr('offset', '0')
            .attr('stop-color', colorScheme[0])
            .attr('stop-opacity', 1);

            
        linearGradient.append('stop')
            .attr('offset', '1')
            .attr('stop-color', colorScheme[1])
            .attr('stop-opacity', 1);
    

        legend.append('rect')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('width', legendWidth)
            .attr('height', innerHeight)
            .style('fill', 'url(#linear-gradient)');

            //tickvalues pass array
        var legendAxis = d3.axisRight(legendScale).ticks(5, "1")
        .tickSize(0, 0);
        
        legend.append("g")
            .attr("class", "legend axis")
            .attr("transform", "translate(" + legendWidth + ", 0)")
            .call(legendAxis);

            
        var  mapGroup = plot
            .selectAll('path')
            .data(geojson)
            .enter()
            .append('path')
            .attr('id', function (d) {  
                return 'c'+d.id } )
            .attr('d', path)
            .style('fill', (d)  => colorCounties(d, years[0]))
            .style('stroke', 'black')
            .style('stroke-width', .5)

        

        d3.selectAll("path").on('click', function() {
            window.location.href = '/countyBars?value=' + this.id
        })

        d3.selectAll("path").on('mouseover', function() {
           d3.select('#'+this.id)
            .style('stroke-width', 2.5)
        })

        d3.selectAll("path").on('mouseleave', function() {
            d3.select('#'+this.id)
             .style('stroke-width', 0.5)
         })

        playButton.on('click', function() {
            var button = d3.select(this);
            if (button.text() == "Pause") {
              moving = false;
              clearInterval(interval);
              button.text("Play");
            } else {
                moving = true;
                button.text("Pause");
                let i = 1;
                interval = setInterval(() => {
                    update(parseTime(years[i]));
                    i++
                    if(i > years.length-1) {
                        clearInterval(interval);
                        moving = false;
                        playButton.text("Play");
                    }
                }, 1000) 
            }            
        })

        function update(h) {
            
            title
                .transition()
                .duration(250)
                .text('Number of Murders per County in ' + formatDateIntoYear(h));
            mapGroup
                .transition()
                .duration(250)
                .style('fill', (d) => colorCounties(d, formatDateIntoYear(h)))
            // update position and text of label according to slider scale
            handle
                .transition()
                .duration(250)
                .attr("cx", x(h));

            label
                .transition()
                .duration(250)
                .attr("x", x(h))
                .text(formatDateIntoYear(h));
            
            // filter data set and redraw plot
            // var newData = dataset.filter(function(d) {
            //     return d.date < h;
            // })
            }

        function colorCounties (data, refYear) {
            let m = data.properties.murders
            let match = data.properties.murders.filter((d) => d.Year === refYear)
            if(match.length > 0) {
                return colorScale(match[0].Count)
            } else {
                return missingColor;
            }
        }

        function linspace(start, end, n) {
                var out = [];
                var delta = (end - start) / (n - 1);
        
                var i = 0;
                while(i < (n - 1)) {
                    out.push(start + (i * delta));
                    i++;
                }
                out.push(end);
                return out;
            }


    }
}


buildChart('#mich-map');
