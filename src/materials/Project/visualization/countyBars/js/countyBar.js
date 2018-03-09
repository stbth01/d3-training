function buildChart(containerId) {
    // size globals
    var width = 1000;
    var height = 700;
    var legendSize = 15;
    var scaleProj = 5000;

    var margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };

    // calculate dimensions without margins
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    // create svg element
    var svg = d3
        .select(containerId)
        .append('svg')
        .attr('height', height)
        .attr('width', width);

    // create inner group element
    var g = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // append all of your chart elements to g

    d3.csv('data/count_by_county.csv', function(error, data) {
        let url = new URL(window.location.href);

        handleError(error, 'failed to load usJson data');
        
        // let countID = 26161;
        let countID = +url.searchParams.get('value').replace("c","");

        years = getYears(data)
        murders = dataPrep(data.filter((x) => {return +x.FIPS === countID}));
        
        draw(murders, years)
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

    function dataPrep(data) {
        var parseTime = d3.timeParse('%Y');
        data.forEach(e => {
            e.Count = +e.Count;
            e.Solved = +e.Solved;
            e.Year =  parseTime((+e.Year).toString());
        });
        return data
    }


    function draw(data, years) {

        var formatDateIntoYear = d3.timeFormat("%Y");

        var bars = svg.selectAll("bars")
            .data(data)

        var switchButton = d3.select("#switch");


        var yScale = d3.scaleLinear()
                        .domain([0, d3.max(data, (d) => +d.Count)])
                        .range([innerHeight, 0])

        var xScale = d3.scaleTime()
                        .domain(
                            d3.extent(data, (d) => d.Year ))   
                        .rangeRound([0 , innerWidth])

        var xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(5));
        var yAxis = d3.axisLeft(yScale);

        var ticks = d3.selectAll(".tick text");

        ticks.attr("class", function(d,i){
            if(i%5 != 0) d3.select(this).remove();
        });

        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(7,'+ innerHeight + ')')
            .call(xAxis)
        
        var yAxisMiddle = g
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis)

        var line = d3
            .line()
            .x((d) => xScale(d.Year))
            .y((d) => yScale(d.Count))

    

        create_bars()
        function create_bars() {
            g
                .selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', (d) =>
                            xScale(d.Year)
                )
                .attr('y', (d)=>
                    yScale(d.Count)
                )
                .attr('width', (innerWidth/years.length) - 5 )
                .attr('height', (d) =>  innerHeight - yScale(d.Count))
                .attr('fill', 'steelblue'
                )
                .on("mouseover", handleBarMouseOver)
                .on("mouseout", handleBarMouseOut);                
            }

        function create_line() {   
                g
                    .append('path')
                    .datum(data)
                    .attr('class', 'win-line')
                    .attr('class', 'line-plot')
                    .attr('fill', 'none')
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2)
                    .attr('d', line)
        
                g
                    .selectAll('win-point')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('class', 'win-point')
                    .attr('class', 'line-plot')
                    .attr('fill', 'red')
                    .attr('stroke', 'none')
                    .attr('cx', (d) => xScale(d.Year))
                    .attr('cy', (d) => yScale(d.Count))
                    .attr('r', 3)
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut);
                }
        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('Year');

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', -35)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,-35,' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Number of Murder in County');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Murders by Year in ' + data[0].Name + ' County');

        switchButton.on('click', function() {
            var button = d3.select(this)
            var dur = 500
            if (button.text().trim() == "Switch to Line Graph") {
                d3.selectAll('.bar')
                .transition()
                .duration(dur)
                .remove()

                button.text("Switch to Bar Graph")

                setTimeout(create_line, dur)
            } else {
                d3.selectAll('.line-plot')
                .transition()
                .duration(dur)
                .remove()

                button.text("Switch to Line Graph")

                setTimeout(create_bars, dur)

            }
        })

        function handleBarMouseOver(d, i) {
            Year  = formatDateIntoYear(d.Year)

            d3.select(this)
                .attr('stroke', 'black')
            
            g
                .append('text')
                .attr('id', "t" + Year + "-" + d.Count + "-" + i)
                .attr("text-anchor", "middle")
                .attr('x', () =>
                            xScale(d.Year)+7
                )
                .attr('y', ()=>
                    yScale(d.Count) - 10
                )
                .text( () => 'Year: ' + Year)

            g
                .append('text')
                .attr('id', "t" + Year + "-" + d.Count + "-" + i)
                .attr("text-anchor", "middle")
                .attr('x', () =>
                            xScale(d.Year)+7
                )
                .attr('y', ()=>
                    yScale(d.Count) - 20
                )
                .text( () => 'Count: ' + d.Count)
        }

        function handleBarMouseOut(d, i) {
            Year  = formatDateIntoYear(d.Year)
            // Use D3 to select element, change color back to normal
            d3.select(this)
                .attr('stroke', 'white')

            // Select text by id and then remove
            d3.selectAll("#t" + Year + "-" + d.Count + "-" + i).remove();  // Remove text location
        }

        function handleMouseOver(d, i) {  // Add interactivity
            Year  = formatDateIntoYear(d.Year)

            // Use D3 to select element, change color and size
            d3.select(this)
                .attr('fill', 'orange')
                .attr('r', 3 * 2)


            // Specify where to put label of text
            g.append("text")
            .attr('id', "t" + Year + "-" + d.Count + "-" + i)  // Create an id for text so we can select it later for removing on mouseout
            .attr('x', function() { return xScale(d.Year) - 30; })
            .attr('y', function() { return yScale(d.Count) - 15; })
            .text(function() {
                return "Year: "+ Year +" Count: "+ d.Count;  // Value of the text
            });
            }

        function handleMouseOut(d, i) {
            Year  = formatDateIntoYear(d.Year)
            // Use D3 to select element, change color back to normal
            d3.select(this)
                .attr('fill', 'red')
                .attr('r', 3)

            // Select text by id and then remove
            d3.select("#t" + Year + "-" + d.Count + "-" + i).remove();  // Remove text location
        }

    };
}

buildChart('#county-bar');
