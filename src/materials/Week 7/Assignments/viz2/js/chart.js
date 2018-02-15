function buildChart(containerId) {
    // size globals
    var width = 960;
    var height = 500;
    var legandSize = 15;
    var scaleProj = 100;

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


        var colorScale = d3.scaleThreshold()
            .domain(d3.range(0, d3.max(cnt, (d)=> +d.Percent)))
            .range(d3.schemeBlues[9]);

        var albersUsaProj = d3
            .geoAlbersUsa()
            .scale(scaleProj)
            .translate([innerWidth / 2, innerHeight / 2]);



        var path = d3.geoPath().projection(albersUsaProj);

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


        var mapGroup = g
            .selectAll('.mapGroup')
            .data(['2012', '2013', '2014', '2015'])
            .enter()
            .append('g')
            .attr('class', 'mapGroup')
            .attr('transform', (d, i) => 'translate('+100 *i+',0)');


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
    }



}

buildChart('#chart-holder');
