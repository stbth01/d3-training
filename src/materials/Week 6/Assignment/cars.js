var fs = require('fs');

const data = fs.readFileSync('./cars.json');

let cars = JSON.parse(data.toString());



//1
var numOfCommon = cars.reduce( function(s, d)  {
    if(+d.make_is_common === 1) { 
        return s + 1; 
    }
    else {
        return s;
    }

}, 0);

console.log("Part 1.1: Number where make is common is "+numOfCommon);

//2
const countries = [];

cars.forEach( function(d) {
    if(!countries.find(x => x.make_country === d.make_country))
    {   
        countries.push({
            make_country: d.make_country,
            total_makes: 1
        })
    }
    else {
        countries.forEach( function(c) {
            if(c.make_country === d.make_country){
                c.total_makes += 1
            }
        })
    }
})

console.log("Part 1.2: The total number of makes per country is ", countries)
//3
const countries_common = [];

cars.forEach( function(d) {
    if(!countries_common.find(x => x.make_country === d.make_country))
    {   
        let c = 0;
        let uc = 0;
        if(+d.make_is_common === 1){
            c = 1;
        }
        else{
            uc = 1;
        }
        countries_common.push({
            make_country: d.make_country,
            total_common: c,
            total_uncommon: uc
        })
    }
    else {
        countries_common.forEach( function(c) {
            if(c.make_country === d.make_country){
                if(+d.make_is_common === 1){
                    c.total_common += 1;
                }
                else{
                    c.total_uncommon += 1;
                }
            }
        })
    }
})

console.log("Part 1.3: The total number of makes per country is ", countries_common)
