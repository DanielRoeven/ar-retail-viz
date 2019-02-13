var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keyBoUtj67XZsejy7' }).base('appCQJs47j3IvmonX');

// Get data from Airtable
var fetchData = function(){
    // Create array to load in examples
    var examples = [];

    // Get all the records from the Examples table in Airtable
    base('Examples by Value').select({
        // Selecting the grid view (tabular layout)
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        
        // Called for each 'page' (~50 records)
        records.forEach(function(record) {
            // Add all fields of records (examples) to examples array
            examples.push(record.fields);
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        // There are no more records
        if (err) {
            // Something went wrong when or after calling the last page
            console.error(err);
            return;
        }
        else {
            // Nothing went wrong, start plotting our examples
            plotData(examples)
        }
    });   
};

// Plot examples we retrieved from Airtable
var plotData = function(examples){

    // Make a list of user values:
    // Map all examples to array with only the field primary user value
    // Map all examples to array with only the field other user values and flatten it
    // Then make join arrays, make unique, and remove undefined
    const primUserValues = examples.map(example => example['Primary User Value']);
    const otherUserValues = _.flatten(examples.map(example => example['Other User Values']));
    const userValues = _.without(_.uniq(_.union(primUserValues, otherUserValues)), undefined);
    
    // Make a list of biz values:
    // Map all examples to array with only the field primary biz value
    // Map all examples to array with only the field other biz values and flatten it
    // Then make join arrays, make unique, and remove undefined
    const primBizValues = examples.map(example => example['Primary Business Value']);
    const otherBizValues = _.flatten(examples.map(example => example['Other Business Values']));
    const bizValues = _.without(_.uniq(_.union(primBizValues, otherBizValues)), undefined);

    // Make a list of contexts:
    // Map all examples to array with only the field context
    // Then make array unique, stripping out duplicate contexts
    const contexts = _.uniq(examples.map(example => example['Context']));
    // Save list of contexts to show
    var contextsToShow = [];

    const colors = [
        d3.schemePastel1[0],
        d3.schemePastel1[1],
        d3.schemePastel1[2],
        d3.schemePastel1[3],
        d3.schemePastel1[4],
        d3.schemePastel1[5],
        d3.schemePastel1[6],
        d3.schemePastel1[7],
        d3.schemePastel1[8],
        d3.schemePastel2[0],
    ];

    var contextColors = {};
    contexts.forEach(function(context, i){
        contextColors[context] = colors[i];
    });

    // Give the context filter buttons a color
    colorButtons(contexts, contextColors);

    // Make d3 look at the div with a css grid
    const grid = d3.select('.grid');

    // Create the user value labels
    // Start by selecting all the existing user value labels (none) so selection set is empty
    const userValueLabels = grid.selectAll('.userValueLabel');
    userValueLabels
        .data(userValues)                               // Bind the data
        .enter()                                        // Prepare selection set
        .append('div')                                  // Create a div for everything not in selection set (everything)
            .attr('class', function(d, i){              // Set classes to userValueLabel and odd/even for zebra stripes
                if (i % 2 == 0) {
                    return 'userValueLabel odd';
                } else {
                    return 'userValueLabel even';
                }
            })
            .style('grid-column', 1)                    // Labels are all in the first column
            .style('grid-row', function(d, i){          // Rows start at 2 (+1 because index starts at 0 but css grid at 1, +1 because top row is other labels)
                return i+2;
            })
                .append('p')                            // Create paragraph inside div
                    .text(function(d){                  // Set text to data (user value)
                        return d + ' ';
                    });

    // Create the biz value labels
    // Start by selecting all the biz value labels (none) so the selection set is empty
    const bizValueLabels = grid.selectAll('.bizValueLabels');
    bizValueLabels
        .data(bizValues)                                // Bind the data
        .enter()                                        // Prepare selection set
        .append('div')                                  // Create a div for everything not in selection set (everything)
            .attr('class', 'bizValueLabel')             // Set class to bizValueLabel
            .style('grid-column', function(d, i){       // Columns start at 2 (+1 because index start at 0 but css grid at 1, +1 because first column is other labels)
                return i+2;
            })
            .style('grid-row', 1)                       // Labels are all in first column
            .append('p')                                // Create paragraph inside div
                .text(function(d){                      // Set text to data (biz value)
                    return d;
                });

    // Create the context buttons
    // Start by selecting the context buttons
    const contextButtons = d3.select('#contextButtonsContainer').selectAll('.contextButtons');
    contextButtons
        .data(contexts)                                 // Bind data
        .enter()                                        // Prepare selection set
        .append('button')                               // Create buttons for everything not in selection set (everything)
            .attr('class', 'btn btn-outline-secondary contextButton')   // Set class (bootstrap + custom)
            .attr('id', function(d){
                return d.replace(/ /g,"-").replace('&','-');                        // Give it a unique, sanitized id
            })
            .attr('type', 'button')
            .attr('data-toggle', 'collapse')                                        // Add collapse toggle for more info
            .attr('data-target', function(d){
                return '#' + d.replace(/ /g,"-").replace('&','-') + '-Description'; // Give it a collapse target for more info
            })
            .text(function(d){
                return d;                               // Set button text
            })
            .on('click', function(d){                   // On click, hide or show examples
                if (_.contains(contextsToShow, d)) {
                    // If context is in list of contexts to show, remove it
                    contextsToShow = _.without(contextsToShow, d)
                } else {
                    // If context is not in list of contexts to show, add it
                    contextsToShow.push(d);
                }

                if (contextsToShow.length > 0) {
                    // If there are contexts to show, hide the examples to hide and show the examples to show

                    // Create an array of the contexts to be hidden
                    const contextsToHide = _.difference(contexts, contextsToShow);
                    // Hide all examples belonging to contexts to hide
                    contextsToHide.forEach(function(contextToHide){

                        // Create class name for context to hide (without spaces, with -Example)
                        const contextToHideClassName = contextToHide.replace(/ /g,"-").replace('&','-') + '-Example';

                        // Get all the examples belonging to context to hide
                        const contextToHideExamples = document.getElementsByClassName(contextToHideClassName);
                        // Hide each examples belonging to context to hide
                        Array.prototype.forEach.call(contextToHideExamples, function(exampleToHide){
                            // Only add the hidden class if it isn't already there
                            if (!exampleToHide.classList.contains('hidden')) {
                                exampleToHide.classList.add('hidden');
                            }
                        });
                    });

                    // Show all example belonging to contexts to show
                    contextsToShow.forEach(function(contextToShow){

                        // Create class name for context to show (without spaces, with -Example)
                        const contextToShowClassName = contextToShow.replace(/ /g,"-").replace('&','-') + '-Example';
                        // Get all the example belonging to context to show
                        const contextToShowExamples = document.getElementsByClassName(contextToShowClassName);
                        // Show each example belonging to a context to show
                        Array.prototype.forEach.call(contextToShowExamples, function(exampleToShow){
                            // Remove the hiddden class
                            exampleToShow.classList.remove('hidden');
                        });
                    })
                } else {
                    // If there are no contexts to show, show all contexts

                    // Get all the examples
                    const contextToShowExamples = document.getElementsByClassName('exampleLabel');
                    // Show each examples
                    Array.prototype.forEach.call(contextToShowExamples, function(exampleToShow){
                        // Remove the hidden class
                        exampleToShow.classList.remove('hidden');
                    });
                }
            });

    var showOnlyTTC = false;
    const notTTCExamples = document.getElementsByClassName('notTTCExample');
    const ttcButton = document.getElementById('buttonTTC');
    ttcButton.addEventListener('click', function(){
        if (showOnlyTTC) {
            // Show other examples
            showOnlyTTC = false;

            Array.prototype.forEach.call(notTTCExamples, function(notTTCExample){
                notTTCExample.classList.remove('hideNotTTC');
            });
        } else {
            // Show only TTC examples
            showOnlyTTC = true;

            Array.prototype.forEach.call(notTTCExamples, function(notTTCExample){
                notTTCExample.classList.add('hideNotTTC');
            });
        }
    });

    fillGrid(bizValues, userValues, examples, contextColors);
};

var fillGrid = function(bizValues, userValues, examples, contextColors){

    bizValues.forEach(function(bizValue, indexBizValue){
        const bizValueExamples = _.filter(examples, function(bizValueExample){
            return _.contains(bizValueExample['Value Intersection'], bizValue);
            //const columnIsPrimBizValue = bizValueExample['Primary Business Value'] === bizValue;
            //const columnIsOtherBizValue = _.contains(bizValueExample['Other Business Values'], bizValue);
            //return columnIsPrimBizValue || columnIsOtherBizValue;
        });

        userValues.forEach(function(userValue, ip){
            const bizValueAndUserValueExamples = _.filter(bizValueExamples, function(bizValueAndUserValueExample){
                return _.contains(bizValueAndUserValueExample['Value Intersection'], userValue);
                //const columnIsPrimUserValue = bizValueAndUserValueExample['Primary User Value'] === userValue;
                //const columnIsOtherUserValue = _.contains(bizValueAndUserValueExample['Other User Values'], userValue);
                //return columnIsPrimUserValue || columnIsOtherUserValue;
            });

            var cell = document.createElement('div');
            cell.style['grid-column'] = (indexBizValue + 2);
            cell.style['grid-row'] = (ip + 2);
            cell.classList.add('cell');
            if (ip % 2 == 0) {
                cell.classList.add('odd')
            } else {
                cell.classList.add('even')
            }

            // const loadMore = document.createElement('button');
            // loadMore.textContent = 'More Examples';
            // loadMore.type = 'button';
            // loadMore.classList.add('loadMoreButton');
            // loadMore.classList.add('btn');
            // loadMore.classList.add('btn-outline-secondary');
            // cell.append(loadMore);

            document.getElementsByClassName('grid')[0].appendChild(cell);

            selection = d3.select(cell).selectAll('.exampleLabel').data(bizValueAndUserValueExamples);
            selection.enter()
                .append('p')
                    .attr('class', function(d){
                        var classString = 'exampleLabel';
                        const contextNoSpaces = d['Context'].replace(/ /g,"-").replace('&','-');
                        classString += ' ' + contextNoSpaces + '-Example';
                        if (d['Creators'] !== 'The Techno Creatives') {
                            classString += ' notTTCExample'
                        }
                        return classString;
                    })
                    .text(function(d){return d['Title of product/project']})
                    // .style('border-width', '2px')
                    // .style('border-style', 'solid')
                    .style('background-color', function(d){
                        return contextColors[d['Context']];
                    })
                .on("click", function(d, i){ 
                    showMoreInfo(d); 
                    selectedExamples = document.getElementsByClassName('selectedExample');
                    
                    Array.prototype.forEach.call(selectedExamples, function(selectedExample){
                        selectedExample.classList.remove('selectedExample');
                    });

                    d3.select(this).classed('selectedExample', d3.select(this).classed('selectedExample') ? false : true);
                })

            selection.enter()
                .append('button')
                    .attr('class', 'loadMoreButton')
                    .text('More');
        });
    });
};

var colorButtons = function(contexts, colors){
    contexts.forEach(function(context){
        const contextSanitized = context.replace(/ /g,'-').replace('&','-');
        const css = generateActiveButtonCSS(contextSanitized, colors[context]);

        const styleEl = document.createElement('style');
        document.head.appendChild(styleEl);
        const styleSheet = styleEl.sheet;
        styleSheet.insertRule(css);
    });
};

var generateActiveButtonCSS = function(context, color) {
    const css = '#' + context + '.active, ' + '#' + context + ':hover {' +
                    'background-color: ' + color + ' !important;' +
                '}'
    return css;
};

var showMoreInfo = function(d){

        // Title
        const title = document.getElementById('projectTitle');
        title.textContent = (d['Title of product/project'] + ' ');

        // Link
        const link = document.getElementById('projectLink');
        if (d['Link']) {
            link.href = d['Link'];
            link.target = '_blank';

            const linkIcon = document.createElement('i');
            linkIcon.classList.add('fas');
            linkIcon.classList.add('fa-external-link-alt');
            title.append(linkIcon);
        } else {
            link.href = '#';
            link.target = '';
        }

        // Byline
        var bylineString = '';
        if (d['Creators']) {
            bylineString = 'by ' + d['Creators'];
        }
        if (d['Company']) {
            bylineString += ' for ' + d['Company'];
        }
        if (d['Year']) {
            bylineString +=  ' (' + d['Year'] + ')';
        }
        const byline = document.getElementById('projectByline');
        byline.textContent = bylineString;

        // Description
        const description = document.getElementById('projectDescription');
        description.textContent = d['Description'];

        // Context, Industry and Interaction Style
        var contextIndustryString = 'A ' + 
                                    d['Context'].toLowerCase() +
                                    ' example in the ' +
                                    d['Industry'].toLowerCase() +
                                    ' industry'
        if (d['Interaction Style']) {
            contextIndustryString += ' using ' + d['Interaction Style'].toLowerCase() + ' interaction.'
        } else {
            contextIndustryString += '.'
        }

        const contextAndIndustry = document.getElementById('projectContextIndustry');
        contextAndIndustry.textContent = contextIndustryString;

        // Purposes
        const primaryPurposeTag = document.createElement('span');
        primaryPurposeTag.classList.add('purposeTag');
        primaryPurposeTag.classList.add('primPurposeTag');
        primaryPurposeTag.textContent = d['Primary Purpose'];
        
        const purposes = document.getElementById('projectPurposes');
        purposes.textContent = 'Purposes:';
        purposes.appendChild(primaryPurposeTag);

        if (d['Secondary Purposes']) {
            d['Secondary Purposes'].forEach(function(purpose){
                const purposeTag = document.createElement('span');
                purposeTag.classList.add('purposeTag');
                purposeTag.textContent = purpose;
                purposes.appendChild(purposeTag);
            });                        
        }

        // Technologies
        const technologies = document.getElementById('projectTech');
        technologies.textContent = 'Technologies:';

        d['Technologies Used'].forEach(function(tech){
            const techTag = document.createElement('span');
            techTag.classList.add('techTag');
            techTag.textContent = tech;
            technologies.appendChild(techTag);
        });

        // Pictures
        const image = document.getElementById('projectImg');
        if (d['Picture']) {
            image.src = d['Picture'];
            image.classList.remove('hidden');
        } else {
            image.classList.add('hidden');
        }

        // Video
        const videoP = document.getElementById('projectVideo');
        const videoLink = document.getElementById('projectVideoLink');
        if (d['Video']) {
            videoLink.textContent = 'Watch a video here ';
            videoLink.href = d['Video'];
            videoP.classList.remove('hidden');
        } else {
            videoP.classList.add('hidden');
        }
};

fetchData();