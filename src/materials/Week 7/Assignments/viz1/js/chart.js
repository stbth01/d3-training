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

    // append all of your chart elements to g
    d3.json('../us-named.json', function(error, usJson) {
        handleError(error, 'failed to load usJson data');
        
        d3.csv('../NSRDB_StationsMeta.csv', function(error, stations){
            handleError(error, 'failed to load stations data');

            console.log(usJson)
            draw(usJson, stations);
        })
    })

    function handleError(error, msg) {
        if(error) {
            console.error(msg);
        }
    };

    function draw(geojson, stations) {

        var albersUsaProj = d3
            .geoAlbersUsa()
            .scale(800)
            .translate([innerWidth / 2, innerHeight / 2]);

        var path = d3.geoPath().projection(albersUsaProj);

        g
            .selectAll('path')
            .data(topojson.feature(geojson, geojson.objects.states).features)
            .enter()
            .append('path')
            .attr('d', path)
            .style('stroke', 'black')
            .style('stroke-width', 0.5)


    }
}

buildChart('#chart-holder');
