function buildChart(containerId) {
    // size globals
    var width = 1500;
    var height = 800;
    var legandSize = 15;
    var scaleProj = 1000;

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
    d3.json('../us-states.json', function(error, usJson) {
        handleError(error, 'failed to load usJson data');
        
        d3.csv('../NSRDB_StationsMeta.csv', function(error, stations){
            handleError(error, 'failed to load stations data');

            //stations = prepDataStations(stations);
            stations.forEach(e => {
                if(e['NSRDB_ELEV (m)'] <= 0) (
                    e['NSRDB_ELEV (m)'] = 1e-6
                )
            })
            console.log(stations)

            draw(usJson, stations);
        })
    })


    function prepDataStations(data) {
        return data
            .map(function(d) {
                return {
                    name: d.STATION,
                    loc: [+d.lng, +d.lat]
                };
            });
    }

    function handleError(error, msg) {
        if(error) {
            console.error(msg);
        }
    };

    function draw(geojson, stations) {

        var classes = []
        var colors = ['red',  'green', 'blue', 'steelblue','yellow', 'pink', 'lime', 'black', 'navy', 'silver', 'skyblue', 'purple', 'olive' ]


        stations.forEach( e => {

            if(classes.indexOf(e.CLASS)===-1){
                classes.push(e.CLASS)
            }
        }
        )

        var colorScale = d3
                .scaleOrdinal()
                .domain(classes)
                .range(colors)

        var logScale = d3
                .scaleLog()
                .domain([1e-6, d3.max(stations, (d) => +d['NSRDB_ELEV (m)'])])
                .range([2,15]);

        // console.log(logScale.domain(), logScale.range(), 
        // stations.forEach(e => console.log(logScale(e['NSRDB_ELEV (m)']))))

        var albersUsaProj = d3
            .geoAlbersUsa()
            .scale(scaleProj)
            .translate([innerWidth / 2, innerHeight / 2]);

        var path = d3.geoPath().projection(albersUsaProj);

        g
            .selectAll('path')
            .data(geojson.features)
            //.data(topojson.feature(geojson, geojson.objects.states).features)
            .enter()
            .append('path')
            .attr('d', path)
            .style('fill', 'white')
            .style('stroke', 'black')
            .style('stroke-width', 0.5)

        g
            .selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                let proj = albersUsaProj([+d.longitude, +d.latitude])
                if(proj) {
                    return albersUsaProj([+d.longitude, +d.latitude])[0]
                }
            })
            .attr('cy', function(d) {
                let proj = albersUsaProj([+d.longitude, +d.latitude])
                if(proj) {
                    return albersUsaProj([+d.longitude, +d.latitude])[1]
                }
            })
            .attr('r', function(d) {
                return logScale(+d['NSRDB_ELEV (m)'])
            })
            .attr('fill', (d) => colorScale(d.CLASS))
            .attr('stroke', 'none');


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


    // title
         g
            .append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .style('font-size', 24)
            .text('Stations by class and Elvation');

    }
}

buildChart('#chart-holder');
