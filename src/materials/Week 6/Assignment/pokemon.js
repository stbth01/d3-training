var fs = require('fs');

const data = fs.readFileSync('./pokemon.json');

let pokemon = JSON.parse(data.toString());

//2.1
let weight_sum = 0;
let height_sum = 0;
let n = 0;

pokemon.forEach(function(d) {
    weight_sum += +d.weight.split(" ")[0] ;
    height_sum += +d.height.split(" ")[0];
    n += 1;
})

let avg_weight_lbs = (weight_sum * 2.20462) /n ;
let avg_height_inch = (height_sum * 39.3701) /n;

console.log("2.1 : Of the " + n + " pokemon in the data set the average weight in lbsis "
+ avg_weight_lbs +" and average height in inch is " + avg_height_inch)

//2
var egg_total = pokemon.reduce(function(s, d, i) {
    if(d.weaknesses.find(x => x === "Psychic")) {
        let e = d.egg.split(" ")[0];
        if(e === "Not"){
            return s - 1
        }
        else{
            return s + +e;
        }
    }
    else {
        return s
    }

}, 0)

//console.log("2.2: Total egg distance (value on egg property) for all pokemon who have a weakness of 'Psychic' is "+egg_total)

//3

const pokeWeaknesses = [];

pokemon.forEach( function(d) {
    let number_weaknesses = d.weaknesses.length;

    d.type.forEach( function(t) {
        if(!pokeWeaknesses.find(x => x.type.toString() === t.toString())){
            pokeWeaknesses.push({
                type: t,
                weaknesses_count: number_weaknesses,
                type_count: 1
            })
        }
        else {
            pokeWeaknesses.forEach( function(p) {
                if(p.type.toString() === t.toString() ){
                    p.weaknesses_count += number_weaknesses,
                    p.type_count += 1
                }
            })
        }
    })
})

var pokeTypeAvg = pokeWeaknesses.map( function(d) {
    return {type: d.type,
            avgWeaknessPerType: +d.weaknesses_count/ +d.type_count}

})

// console.log(pokeTypeAvg)

//3
pokemonSort = pokemon; 
numberOfBuckets = 5
bucketSize = (pokemon.length - (pokemon.length % numberOfBuckets)) / numberOfBuckets


pokemonSort.sort(function (a , b) {
    return +a.weight.split(" ")[0] > +b.weight.split(" ")[0] ? 1 : -1;
})

const buckets = [];

for( i=0; i < numberOfBuckets; i++ ){
    if( i === numberOfBuckets -1){
        buckets.push( {bucket: i + 1,
            pokemonBucket: pokemonSort.slice(i*bucketSize, pokemonSort.length + 1)
        }
        )
    }
    else {
        buckets.push(
            {bucket: i + 1,
            pokemonBucket: pokemonSort.slice(i*bucketSize, (i+1)* bucketSize)}
        )
    }
}

const bucketSpawnTime = [];

buckets.forEach(function(d) {
    let spawnTimeTotal = 0;

    d.pokemonBucket.forEach( function(b) {
        if( b.spawn_time!='N/A'){
            spawnTimeTotal += Date.parse('01 Jan 1970 '+ b.spawn_time);
        }
    })
    bucketSpawnTime.push({
        bucket: d.bucket,
        avgSpawnTime: (spawnTimeTotal/60000)/ d.pokemonBucket.length
    })
})

console.log("2.3", bucketSpawnTime)