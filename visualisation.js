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
    var primaryPurposes = examples.map(example => example['Primary Purpose']);
    primaryPurposes = d3.set(primaryPurposes).values();
    
    var contexts = examples.map(example => example.Context);
    contexts = d3.set(contexts).values();

    var themes = examples.map(example => example.Theme);
    themes = d3.set(themes).values();
    colorButtons(themes);

    var grid = d3.select('.grid');

    var primaryPurposeLabels = grid.selectAll('.primaryPurposeLabel');
    primaryPurposeLabels.data(primaryPurposes)
                .enter()
                .append('div')
                    .attr('class', 'primaryPurposeLabel')
                    .style('grid-column', 1)
                        .style('grid-row', function(d, i){return i+2})
                    .append('p')
                        .text(function(d){return d});

    var contextLabels = grid.selectAll('.contextLabel');
    contextLabels.data(contexts)
                    .enter()
                    .append('div')
                        .attr('class', 'contextLabel')
                    .style('grid-column', function(d, i){return i+2})
                        .style('grid-row', 1)
                        .append('p')
                            .text(function(d){return d});

    var bAndMExamples = _.filter(examples, function(example){
        return example.Context === 'B&M retail'
    });

    contexts.forEach(function(context, ic){
        contextExamples = _.filter(examples, function(contextExample){
            return contextExample.Context === context;
        });

        primaryPurposes.forEach(function(primaryPurpose, ip){
            contextAndPrimaryPurposeExamples = _.filter(contextExamples, function(contextAndPrimaryPurposeExample){
              return contextAndPrimaryPurposeExample['Primary Purpose'] === primaryPurpose;
            });

            var cell = document.createElement('div')
            cell.style['grid-column'] = (ic + 2);
            cell.style['grid-row'] = (ip + 2);
            cell.classList.add('cell');

            document.getElementsByClassName('grid')[0].appendChild(cell)

            d3.select(cell).selectAll('.exampleLabel')
                .data(contextAndPrimaryPurposeExamples)
                .enter()
                .append('p')
                    .attr('class', 'exampleLabel')
                    .text(function(d){return d['Title of product/project']})
                    .style('background-color', function(d){
                        switch(d['Theme']) {
                            case 'AR Presentation':
                                return d3.schemeSet3[0];
                            case 'AR Catalog':
                                return d3.schemeSet3[2];
                            case 'AR Try-on':
                                return d3.schemeSet3[3];
                            case 'Digital Fit Determination':
                                return d3.schemeSet3[4];
                            case 'VR Catalog':
                                return d3.schemeSet3[5];
                            case 'Appealing to the Senses':
                                return d3.schemeSet3[6];
                            case 'Virtual Preview':
                                return d3.schemeSet3[7];
                            case 'AR More Info':
                                return d3.schemeSet3[8];
                            case 'Attract Through AR':
                                return d3.schemeSet3[9];
                            case 'Grab Attention':
                                return d3.schemeSet3[10];
                            default:
                                console.log(d['Theme'])
                                throw new Error('Theme does not exist!');
                        };
                    });
                    
        });
    });
  //var bgColorsD3 = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];
};

var colorButtons = function(themes){
    themes.forEach(function(theme){
        theme = theme.replace(/ /g,"-");
        var css = '';
        switch(theme) {
            case 'AR-Presentation':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[0]);
                break;
            case 'AR-Catalog':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[2]);
                break;
            case 'AR-Try-on':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[3]);
                break;
            case 'Digital-Fit-Determination':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[4]);
                break;
            case 'VR-Catalog':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[5]);
                break;
            case 'Appealing-to-the-Senses':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[6]);
                break;
            case 'Virtual-Preview':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[7]);
                break;
            case 'AR-More-Info':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[8]);
                break;
            case 'Attract-Through-AR':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[9]);
                break;
            case 'Grab-Attention':
                css = generateActiveButtonCSS(theme, d3.schemeSet3[10]);
                break;
            default:
                throw new Error('Theme does not exist!');
        };

        var styleEl = document.createElement('style');
        document.head.appendChild(styleEl);
        var styleSheet = styleEl.sheet;
        styleSheet.insertRule(css);
    });
};

var generateActiveButtonCSS = function(theme, color) {
    const css = '#' + theme + '.active {' +
                    'background-color: ' + color + ' !important;' +
                '}'
    return css;
};

fetchData();