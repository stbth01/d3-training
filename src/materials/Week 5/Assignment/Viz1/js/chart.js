function buildChart(containerId) {
    // size globals
    var width = 960;
    var height = 500;

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

    d3.json("../climate.json", function(error, data) {
        // handle read errors
        if (error) {
            console.error('failed to read data');
            return;
        }

        var parseTime = d3.timeParse('%Y')

        data.forEach(element => {
            element.temp = +element.temp
            element.year = parseTime((+element.year).toString())
        });

        console.log('clean', data);

        var xScale = d3.scaleTime()
                    .domain(
                        d3.extent(data, (d) => d.year ))
                    .range([0, innerWidth])

        console.log(xScale.domain(), xScale.range());

        var yScale = d3.scaleLinear()
                        .domain(
                            d3.extent(data, (d) => d.temp ))
                        .range([innerHeight, 0])

         console.log(yScale.domain(), yScale.range());

        var xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(5));
        var yAxis = d3.axisLeft(yScale)
        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,'+ yScale(0)+')')
            .call(xAxis)

        g
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis)

        var line = d3
                .line()
                .x((d) => xScale(d.year))
                .y((d) => yScale(d.temp))

        g
            .append('path')
            .datum(data)
            .attr('class', 'win-line')
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
            .attr('fill', 'red')
            .attr('stroke', 'none')
            .attr('cx', (d) => xScale(d.year))
            .attr('cy', (d) => yScale(d.temp))
            .attr('r', 3)


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
            .attr('x', -30)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,-30,' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Temp');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Temp by Year');

    })
}

buildChart('#chart-holder');
