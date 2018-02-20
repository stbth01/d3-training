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

    var xScale;
    var yScale;
    var xAxis;
    // append all of your chart elements to g
    d3.csv('data/air_quality.csv', function(error, data) {
        // handle read errors
        if (error) {
            console.error('failed to read data');
            return;
        }


        data, region = dataPrep(data); 
        
        draw(sortData(data, 'state'), region);

        
    d3.select('#radio-buttons').on('click', () => {
        var order;
        var delayLength = +this.delay.value;

        if(isNaN(delayLength)) {
            alert("Please enter a Numeric Value");
            return;
        }
        
        if(this.states.checked) {
            order = 'state';
        }
        if(this.emissionsDes.checked) {
            order = 'des';
        }
        if(this.emissionsAsc.checked) {
            order = 'asc';
        }
        data = sortData(data, order)

        xScale = d3.scaleBand()
        .domain(
            data.map( (d)=>
            d.State)
        )
        .range([0,innerWidth])
        .padding(.1);

        g
            .selectAll('.bar')
            .data(data)
            .transition()
            .duration(1500)
            .delay(function (d,i) {return delayLength*i})
            .attr('x', (d) =>
                xScale(d.State)
            )
            .attr('y', (d) => 
                yScale(d.Emissions)
            )
            .attr('height', (d) =>
                innerHeight - yScale(d.Emissions)
            )

        g.selectAll('.x-axis')
            .transition()
            .duration(1500)
            .delay(function (d,i) {return delayLength*i})
            .call(d3.axisBottom(xScale))
     })

    });


    function dataPrep(data) {
       
        data.forEach(element => {
            element.Emissions = +element.Emissions.replace(',','')
        });

        var region = []
        
        data.forEach( e => {
            if(region.indexOf(e.Region)===-1){
                region.push(e.Region)
            }
        })

        return data, region;
    };

    function sortData(data, order) {
        if(order === "state") {
            data.sort((a,b) => {
                return a.State < b.State ? -1 : 1;
            })
        }
        else if (order === "des")
        data.sort((a,b) => {
            return a.Emissions > b.Emissions ? 1 : -1}
        )
        else if (order === "asc")
        data.sort((a,b) => {
            return a.Emissions > b.Emissions ? -1 : 1}
        )

        return data; 
        
    }

    function draw(data, region) {

        var colorScheme = d3.schemeCategory10

        xScale = d3.scaleBand()
            .domain(
                data.map( (d)=>
                d.State)
            )
            .range([0,innerWidth])
            .padding(.1);

        yScale = d3.scaleLinear()
            .domain([
                0,d3.max(data, (d)=> d.Emissions)   
            ])
            .range([innerHeight, 0])

        var coloreScale = d3.scaleOrdinal()
            .domain(region)
            .range(colorScheme);

        xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

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

    }

}

buildChart('#chart-holder');
