var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keyBoUtj67XZsejy7' }).base('appCQJs47j3IvmonX');

var fetchData = function(){
    var examples = [];

    base('Examples').select({
        // Selecting the first 3 records in Grid view:
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function(record) {
            examples.push(record.fields);
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        if (err) {
            console.error(err);
            return;
        }
        else {
            plotData(examples)
        }
    });   
};

var plotData = function(examples){
    var themes = examples.map(example => example.Theme);
    themes = d3.set(themes).values();
    
    var contexts = examples.map(example => example.Context);
    contexts = d3.set(contexts).values();

    var grid = d3.select('.grid');

    var themeLabels = grid.selectAll('.themeLabel');
    themeLabels.data(themes)
                .enter()
                .append('div')
                    .attr('class', 'themeLabel')
                    .style('grid-column', function(d, i){return i+2})
                    .style('grid-row', 5)
                    .append('p')
                        .text(function(d){return d});

    var contextLabels = grid.selectAll('.contextLabel');
    contextLabels.data(contexts)
                    .enter()
                    .append('div')
                        .attr('class', 'contextLabel')
                        .style('grid-column', 1)
                        .style('grid-row', function(d, i){return i+1})
                        .append('p')
                            .text(function(d){return d});

    // groups.data(examples)
    //         .enter()
    //         .append('g')
    //             .attr('transform', function(d, i){
    //                 var transform = 'translate(';
    //                 console.log(i);
    //                 switch(d['Primary Purpose']) {
    //                     case 'App Installs':
    //                         transform = transform + (1000/12)*1;
    //                         break;
    //                     case 'B&M Store Traffic':
    //                         transform = transform + (1000/12)*2;
    //                         break;
    //                     case 'Purchasing Confidence':
    //                         transform = transform + (1000/12)*3;
    //                         break;
    //                     case 'Brand Campaign':
    //                         transform = transform + (1000/12)*4;
    //                         break;
    //                     case 'Convenience':
    //                         transform = transform + (1000/12)*5;
    //                         break;
    //                     case 'Personalisation':
    //                         transform = transform + (1000/12)*6;
    //                         break;
    //                     case 'Product Launch':
    //                         transform = transform + (1000/12)*7;
    //                         break;
    //                     case 'Demo Features / Explain Concept':
    //                         transform = transform + (1000/12)*8;
    //                         break;
    //                     case 'Stand Out':
    //                         transform = transform + (1000/12)*9;
    //                         break;
    //                     case 'Store Launch':
    //                         transform = transform + (1000/12)*10;
    //                         break;
    //                     case '3D Content Creation':
    //                         transform = transform + (1000/12)*11;
    //                         break;
    //                     default:
    //                         console.log(d['Primary Purpose'])
    //                         throw new Error('Primary purpose does not exist!');
    //                 };

    //                 switch(d['Context']) {
    //                     case 'B&M Retail':
    //                         transform = transform + ', ' + ((1000/5)*1 + Math.random()*100);
    //                         break;
    //                     case 'Online Retail':
    //                         transform = transform + ', ' + ((1000/5)*2 + Math.random()*100);
    //                         break;
    //                     case 'Retail Campaign':
    //                         transform = transform + ', ' + ((1000/5)*3 + Math.random()*100);
    //                         break;
    //                     case 'Expo':
    //                         transform = transform + ', ' + ((1000/5)*4 + Math.random()*100);
    //                         break;
    //                     default:
    //                         console.log(d['Context'])
    //                         throw new Error('Context does not exist!');
    //                 };

    //                 transform = transform + ')';
    //                 return transform;
    //             })
    //             .append('rect')
    //                 .attr('width', '80')
    //                 .attr('height', '20')
    //                 .attr('fill', function(d){
    //                     switch(d['Theme']) {
    //                         case 'AR Presentation':
    //                             return "#3366cc";
    //                         case 'AR Catalog':
    //                             return "#dc3912";
    //                         case 'AR Try-on':
    //                             return "#ff9900";
    //                         case 'Digital Fit Determination':
    //                             return "#109618";
    //                         case 'VR Catalog':
    //                             return "#990099";
    //                         case 'Appealing to the Senses':
    //                             return "#0099c6";
    //                         case 'Virtual Preview':
    //                             return "#dd4477";
    //                         case 'AR More Info':
    //                             return "#66aa00";
    //                         case 'Attract Through AR':
    //                             return "#b82e2e";
    //                         case 'Grab Attention':
    //                             return "#316395";
    //                         default:
    //                             console.log(d['Primary Purpose'])
    //                             throw new Error('Primary purpose does not exist!');
    //                     };
    //                 });
                    
//     rects = grid.selectAll('rect');
    
//     rects.data(examples)
//             .enter()
//             .append('rect')
//                 .attr('height', 20)
//                 .attr('width', 100)
//                 .attr('rx', 10)
//                 .attr('ry', 10)
//                 .attr('fill', function(d){
//                     switch(d['Theme']) {
//                         case 'AR Presentation':
//                             return "#3366cc";
//                         case 'AR Catalog':
//                             return "#dc3912";
//                         case 'AR Try-on':
//                             return "#ff9900";
//                         case 'Digital Fit Determination':
//                             return "#109618";
//                         case 'VR Catalog':
//                             return "#990099";
//                         case 'Appealing to the Senses':
//                             return "#0099c6";
//                         case 'Virtual Preview':
//                             return "#dd4477";
//                         case 'AR More Info':
//                             return "#66aa00";
//                         case 'Attract Through AR':
//                             return "#b82e2e";
//                         case 'Grab Attention':
//                             return "#316395";
//                         default:
//                             console.log(d['Primary Purpose'])
//                             throw new Error('Primary purpose does not exist!');
//                     }
//                 })
//                 .attr('y', function(d){
//                     switch(d['Context']) {
//                         case 'B&M Retail':
//                             return 200 + Math.random()*150;
//                         case 'Online Retail':
//                             return 400 + Math.random()*150;
//                         case 'Retail Campaign':
//                             return 600 + Math.random()*150;
//                         case 'Expo':
//                             return 800 + Math.random()*150;
//                         default:
//                             throw new Error('Context does not exist!');
//                             return;
//                     }
//                 })
//                 .attr('x', function(d){
//                     switch(d['Primary Purpose']) {
//                         case 'App Installs':
//                             return (1000/12)*1 + Math.random()*150;
//                         case 'B&M Store Traffic':
//                             return (1000/12)*2 + Math.random()*150;
//                         case 'Purchasing Confidence':
//                             return (1000/12)*3 + Math.random()*150;
//                         case 'Brand Campaign':
//                             return (1000/12)*4 + Math.random()*150;
//                         case 'Convenience':
//                             return (1000/12)*5 + Math.random()*150;
//                         case 'Personalisation':
//                             return (1000/12)*6 + Math.random()*150;
//                         case 'Product Launch':
//                             return (1000/12)*7 + Math.random()*150;
//                         case 'Demo Features / Explain Concept':
//                             return (1000/12)*8 + Math.random()*150;
//                         case 'Stand Out':
//                             return (1000/12)*9 + Math.random()*150;
//                         case 'Store Launch':
//                             return (1000/12)*10 + Math.random()*150;
//                         case '3D Content Creation':
//                             return (1000/12)*11 + Math.random()*150;
//                         default:
//                             console.log(d['Primary Purpose'])
//                             throw new Error('Primary purpose does not exist!');
//                     }
//                 })

//     labels = grid.selectAll('text');

//     labels.data(examples)
//             .enter()
//             .append('text')
//                 .attr('height', 20)
//                 .attr('width', 100)
//                 .attr('fill', '#00')
//                 .attr('y', function(d){
//                     switch(d['Context']) {
//                         case 'B&M Retail':
//                             return 200 + Math.random()*150;
//                         case 'Online Retail':
//                             return 400 + Math.random()*150;
//                         case 'Retail Campaign':
//                             return 600 + Math.random()*150;
//                         case 'Expo':
//                             return 800 + Math.random()*150;
//                         default:
//                             throw new Error('Context does not exist!');
//                             return;
//                     }
//                 })
//                 .attr('x', function(d){
//                     switch(d['Primary Purpose']) {
//                         case 'App Installs':
//                             return (1000/12)*1 + Math.random()*150;
//                         case 'B&M Store Traffic':
//                             return (1000/12)*2 + Math.random()*150;
//                         case 'Purchasing Confidence':
//                             return (1000/12)*3 + Math.random()*150;
//                         case 'Brand Campaign':
//                             return (1000/12)*4 + Math.random()*150;
//                         case 'Convenience':
//                             return (1000/12)*5 + Math.random()*150;
//                         case 'Personalisation':
//                             return (1000/12)*6 + Math.random()*150;
//                         case 'Product Launch':
//                             return (1000/12)*7 + Math.random()*150;
//                         case 'Demo Features / Explain Concept':
//                             return (1000/12)*8 + Math.random()*150;
//                         case 'Stand Out':
//                             return (1000/12)*9 + Math.random()*150;
//                         case 'Store Launch':
//                             return (1000/12)*10 + Math.random()*150;
//                         case '3D Content Creation':
//                             return (1000/12)*11 + Math.random()*150;
//                         default:
//                             console.log(d['Primary Purpose'])
//                             throw new Error('Primary purpose does not exist!');
//                     }
//                 })
};

fetchData();