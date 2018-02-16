function buildChart(containerId) {
    // size globals
    var width = 2000;
    var height = 500;
    var legendSize = 15;
    var scaleProj = 400;

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
    d3.json('../us-counties.json', function(error, usJson) {
        handleError(error, 'failed to load usJson data');
        
        d3.csv('../laucnty12.csv', function(error, cnt12){
            handleError(error, 'failed to load cnt12 data');

            d3.csv('../laucnty13.csv', function(error, cnt13){
                handleError(error, 'failed to load cnt13 data');

                d3.csv('../laucnty14.csv', function(error, cnt14){
                    handleError(error, 'failed to load cnt14 data');

                    d3.csv('../laucnty15.csv', function(error, cnt15){
                        handleError(error, 'failed to load cnt15 data');

                        d3.csv('../laucnty16.csv', function(error, cnt16){
                            handleError(error, 'failed to load cnt16 data');

                            var cnt = [];
                            //cnt=cnt.concat(cnt13);
                            let lst = [cnt12,cnt13,cnt14,cnt15,cnt16]

                            lst.forEach((x) => cnt=cnt.concat(x))

                            cnt.forEach((x) => { 
                                x.Percent = +x.Percent
                                x.FIPS = +(x.StateCode + x.CountyCode)
                                //console.log(x.StateCode, x.CountyCode, x.FIPS)
                            })

                            usJson.features.forEach((x) => {
                                x.properties.cnts = cnt.filter(i => i.FIPS === x.id)

                            })

                            usJson= usJson.features.filter((i) => i.properties.cnts.length === 5);
                            //console.log("Hello", cnt.filter( (i) => i.FIPS === 0))

                            draw(usJson, cnt );
                            

                        });
                    });
                });
            });
        });
    });

    function handleError(error, msg) {
        if (error) {
            console.error(msg);
        }
    }

    function draw(geojson, cnt) {

        var colorScheme = d3.schemeBlues[9];


        var colorScale = d3.scaleLinear()
            .domain(linspace(0, d3.max(cnt, (d)=> +d.Percent), colorScheme.length))
            .range(colorScheme);

        var legendScale = d3.scaleLinear()
            .domain([0, d3.max(cnt, (d)=> +d.Percent)])
            .range([ 0,innerHeight]);


        var albersUsaProj = d3
            .geoAlbersUsa()
            .scale(scaleProj)
            .translate([innerWidth / 8, innerHeight / 2]);

        var path = d3.geoPath().projection(albersUsaProj);

        var legendWidth = 15 ;

        var legend = g
            .append('g')
            .attr('width', legendWidth)
            .attr('height', innerHeight)
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


        var linearGradient = legend
            .append('defs')
            .append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        var pct = linspace(0, d3.max(cnt, (d)=> +d.Percent), colorScheme.length).map(function(d) {
                return Math.round(d) + '%';
            });

        var colourPct = d3.zip(pct, colorScheme);


        colourPct.forEach(function(d) {
            linearGradient.append('stop')
                .attr('offset', d[0])
                .attr('stop-color', d[1])
                .attr('stop-opacity', 1);
        });

        legend.append('rect')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('width', legendWidth)
            .attr('height', innerHeight)
            .style('fill', 'url(#linear-gradient)');

        var legendAxis = d3.axisRight(legendScale)
            // .tickValues(d3.range(0, d3.max(cnt, (d)=> +d.Percent)))
            // .tickFormat(d3.format("d"))

        
        legend.append("g")
            .attr("class", "legend axis")
            .attr("transform", "translate(" + legendWidth + ", 0)")
            .call(legendAxis);

        var yearList = ['2012', '2013', '2014', '2015']

        var mapGroup = g
            .selectAll('.mapGroup')
            .data(yearList)
            .enter()
            .append('g')
            .attr('class', 'mapGroup')
            .attr('transform', (d, i) => 'translate('+ 300 *i +',0)');

         g
            // .selectAll('text')
            // .data(yearList)
            // .enter()
            .append('text')
            .attr('class', 'title')
            .attr('x',  200)//(d, i) =>  (300 *i)/2)
            .attr('y', 100)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text( '2012')//(d) => d);

            g
            .append('text')
            .attr('class', 'title')
            .attr('x',  500)
            .attr('y', 100)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text( '2013')
            
            
            g
            .append('text')
            .attr('class', 'title')
            .attr('x',  800)
            .attr('y', 100)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text( '2014')
            
            g
            .append('text')
            .attr('class', 'title')
            .attr('x',  1100)
            .attr('y', 100)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text( '2015')

        mapGroup
            .selectAll('path')
            .data(geojson)
            .enter()
            .append('path')
            .attr('d', path)
            .style('fill', function (d) { 
                let parent = d3.select(this.parentNode)
                return colorScale(d.properties.cnts.filter((i) => i.Year === parent.datum())[0].Percent)
            })
            .style('stroke', 'black')
            .style('stroke-width', 0.5)


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

buildChart('#chart-holder');
