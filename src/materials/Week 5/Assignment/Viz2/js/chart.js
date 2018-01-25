function buildChart(containerId) {
    // size globals
    var width = 960;
    var height = 500;
    var legandSize = 15;

    var margin = {
        top: 50,
        right: 0,
        bottom: 50,
        left: 100
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

    d3.json("../population.json", function(error, data) {
        // handle read errors
        if (error) {
            console.error('failed to read data');
            return;
        }


        var parseTime = d3.timeParse('%Y')

        data.forEach(element => {
            element.pop = +element.pop
            element.year = parseTime((+element.year.substring(element.year.length -4)).toString())
        });

        console.log('clean', data);

        var xScale = d3.scaleTime()
                    .domain(
                        d3.extent(data, (d) => d.year ))
                    .range([0, innerWidth])

        console.log(xScale.domain(), xScale.range());

        var yScale = d3.scaleLinear()
                        .domain(
                            d3.extent(data, (d) => d.pop ))
                        .range([innerHeight, 0])

         console.log(yScale.domain(), yScale.range());

        var xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(5));
        var yAxis = d3.axisLeft(yScale)
        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,'+ innerHeight+')')
            .call(xAxis)

        g
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis)

        var line = d3
                .line()
                .x((d) => xScale(d.year))
                .y((d) => yScale(d.pop))
                .defined((d) => 
                    d.pop > 0
            )

        var countries = []
        var colors = ['red', 'steelblue', 'green', 'blue', 'yellow', 'pink', 'lime', 'black', 'navy', 'silver', 'skyblue', 'purple', 'olive' ]
    
        data.forEach( e => {

            if(countries.indexOf(e.country)===-1){
                countries.push(e.country)
            }
        }
        )

        console.log(countries)

        var colorScale = d3
                        .scaleOrdinal()
                        .domain(countries)
                        .range(colors)

        var groups = g
            .selectAll('.countries')
            .data(countries)
            .enter()
            .append('g')
            .attr('class', 'countries');

        groups
            .append('path')
            .datum((d) => data.filter( r => r.country === d) )
            .attr('class', 'win-line')
            .attr('fill', 'none')
            .attr('stroke', (d) => colorScale(d[0].country))
            .attr('stroke-width', 2)
            .attr('d', line);

        var legend = g
            .selectAll('.legand')
            .data(colorScale.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
              var height = legandSize;
              var x = 5;
              var y = i * height;
              return 'translate(' + x + ',' + y + ')';
          });

        legend.append('rect')
          .attr('width', legandSize)
          .attr('height', legandSize)
          .style('fill', colorScale)
          .style('stroke', colorScale);
          
        legend.append('text')
          .attr('x', legandSize + 5)
          .attr('y', legandSize - 5)
          .text(function(d) { return d; });

        // g
        //     .selectAll('win-point')
        //     .data(data)
        //     .enter()
        //     .append('circle')
        //     .attr('class', 'win-point')
        //     .attr('fill', 'red')
        //     .attr('stroke', 'none')
        //     .attr('cx', (d) => xScale(d.year))
        //     .attr('cy', (d) => yScale(d.temp))
        //     .attr('r', 3)


        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('Country');

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', -30)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,-30,' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Pop');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Pop by Year for given Countries');

    })
}

buildChart('#chart-holder');
