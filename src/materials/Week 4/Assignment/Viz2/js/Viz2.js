function buildChart(containerId) {
    // size globals
    var width = 960;
    var height = 500;

    var margin = {
        top: 50,
        right: 5,
        bottom: 50,
        left: 75
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
    d3.csv('../air_quality.csv', function(error, data) {
        // handle read errors
        if (error) {
            console.error('failed to read data');
            return;
        }

        console.log('raw', data);

        data.forEach(element => {
            console.log(typeof(element.Emissions))
            element.Emissions = +element.Emissions.replace(',','')
        });

        var region = []
        
        data.forEach( e => {

            if(region.indexOf(e.Region)===-1){
                region.push(e.Region)
            }
        }
        )
    
        console.log('clean', data);
        console.log('region', region);


        var xScale = d3.scaleBand()
            .domain(
                data.map( (d)=>
                d.State)
            )
            .range([0,innerWidth])
            .padding(.1);

        var yScale = d3.scaleLinear()
            .domain([
                0,d3.max(data, (d)=> d.Emissions)   
            ])
            .range([innerHeight, 0])

        var coloreScale = d3.scaleOrdinal()
            .domain(region)
            .range(['red', 'steelblue', 'green', 'blue', 'yellow', 'pink', 'lime', 'black', 'navy', 'silver', 'skyblue', 'purple', 'olive' ])
    

        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        console.log(xAxis, yScale.range());

        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + innerHeight + ')')
            .call(xAxis);

        g
            .append('g')
            .attr('class', 'y-axis')
            .call(yAxis);


        g
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d) =>
                xScale(d.State)
            )
            .attr('y', (d) => 
                yScale(d.Emissions)
            )
            .attr('width', xScale.bandwidth())
            .attr('height', (d) =>
                 innerHeight - yScale(d.Emissions)
            )
            .attr('fill', (d) =>
                coloreScale(d.Region)
            );

            g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('State');

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', -50)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,-50,' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Emissions');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Emissions by State colored by Region');


    })




}

buildChart('#chart-holder');
