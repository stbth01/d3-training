
    //Width and height
    var width = 1000;
    var height = 1070;

    var margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }

    var innerWidth = width - (margin.left *2)
  

    var svg = d3.select("#viz")
                .append("svg")
                .attr("width",width)
                .attr("height", height);
    
    var g = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ', '+ margin.top +' )');


	
d3.json("../climate.json", function(data){
        var innerHeight = data.length * 7
        console.log('raw', data);

        data.forEach(element => {
            element.temp = +element.temp
            element.dec = element.year.substring(1,3)
        });

        var decades = []
        
        data.forEach( e => {

            if(decades.indexOf(e.dec)===-1){
                decades.push(e.dec)
            }
        }
        )
    
        console.log('clean', data);
        console.log('decades', decades);

        var bars = svg.selectAll("bars")
            .data(data)


        var xScale = d3.scaleLinear()
                        .domain([d3.min(data, (d) => d.temp), d3.max(data, (d) => d.temp)])
                        .range([0, innerWidth])

        var yScale = d3.scaleBand()
                        .domain(
                            data.map(function(d) {
                                return d.year
                            })
                        )    
                        .rangeRound([0 , innerHeight])
                        .paddingInner(2/7)
                        .paddingOuter(0)
        
                        console.log('clean', data.length);

        var coloreScale = d3.scaleOrdinal()
        .domain(decades)
        .range(['red', 'steelblue', 'green', 'blue', 'yellow', 'pink', 'lime', 'black', 'navy', 'silver', 'skyblue', 'purple', 'olive' ])

        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,'+ innerHeight + ')')
            .call(xAxis)
        
        var yAxisMiddle = g
            .append('g')
            .attr('class', 'y-axis')
            .attr('transform', 'translate('+ xScale(0) + '0)' )
            .call(yAxis)
            
        yAxisMiddle.selectAll("text").remove();

        var yAxisLeft = g
        .append('g')
        .attr('class', 'y-axis')
        
        .call(yAxis)
        

        g
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d) =>
                        xScale(Math.min(0, d.temp))
            )
            .attr('y', (d)=>
                yScale(d.year)
            )
            .attr('width', (d) =>
                Math.abs(xScale(d.temp) - xScale(0))
             )
            .attr('height', yScale.bandwidth())
            .attr('fill', (d) =>
                coloreScale(d.dec)
            );

            console.log('ysclae bandwidth', yScale.bandwidth())

        g
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text('Temp');

        g
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('x', -35)
            .attr('y', innerHeight / 2)
            .attr('transform', 'rotate(-90,-35,' + innerHeight / 2 + ')')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .text('Year');

        // title
        g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Yearly Temp');


        
        
        
    

});
