var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keyBoUtj67XZsejy7' }).base('appCQJs47j3IvmonX');
var allExamples = [];
var activeExamples = [];
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
displayMode = 'highlight';

// Get data from Airtable
var fetchData = function(){

    // Get all the records from the Examples table in Airtable
    base('Examples by Value').select({
        // Selecting the grid view (tabular layout)
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        
        // Called for each 'page' (~50 records)
        records.forEach(function(record) {
            // Add all fields of records (examples) to examples array
            allExamples.push(record.fields);
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
            activeExamples = allExamples;
            renderFramework();
        }
    });   
};

// Plot examples we retrieved from Airtable
var renderFramework = function(){

    // Make a list of user values:
    // Map all examples to array with only the field primary user value
    // Map all examples to array with only the field other user values and flatten it
    // Then make join arrays, make unique, and remove undefined
    const primUserValues = allExamples.map(example => example['Primary User Value']);
    const otherUserValues = _.flatten(allExamples.map(example => example['Other User Values']));
    const userValues = _.without(_.uniq(_.union(primUserValues, otherUserValues)), undefined);
    
    // Create copy of list of user values with header element at beginning
    const userValuesWithHeader = userValues.slice();
    userValuesWithHeader.unshift('Column Header')

    // Make a list of biz values:
    // Map all examples to array with only the field primary biz value
    // Map all examples to array with only the field other biz values and flatten it
    // Then make join arrays, make unique, and remove undefined
    const primBizValues = allExamples.map(example => example['Primary Business Value']);
    const otherBizValues = _.flatten(allExamples.map(example => example['Other Business Values']));
    const bizValues = _.without(_.uniq(_.union(primBizValues, otherBizValues)), undefined);

    // Create list of biz values with header element at beginning
    const bizValuesWithHeader = bizValues.slice();
    bizValuesWithHeader.unshift('Row Header')
    
    // Make a list of contexts:
    // Map all examples to array with only the field context
    // Then make array unique, stripping out duplicate contexts
    const contexts = _.uniq(allExamples.map(example => example['Context']));
    // Save list of contexts to show
    var contextsToShow = [];

    var contextColors = {};
    contexts.forEach(function(context, i){
        contextColors[context] = colors[i];
    });

    // Give the context filter buttons a color
    colorButtons(contexts, contextColors);

    // Create flattened matrix with index tuples for cells
    var cellTuples = [];
    bizValuesWithHeader.forEach(function(bizValue, bizValueIndex){
        userValuesWithHeader.forEach(function(userValue, userValueIndex){
            const column = bizValueIndex + 1;
            const row = userValueIndex + 1;
            const cellTuple = {bizValue, column, userValue, row}
            cellTuples.push(cellTuple);
        });
    });
    // Remove header/header tuple, maybe replace with axis labels?
    cellTuples.shift();

    const columnHeaderTuples = _.filter(cellTuples, function(cellTuple){return cellTuple['row'] === 1});
    const rowHeaderTuples = _.filter(cellTuples, function(cellTuple){return cellTuple['column'] === 1});
    const contentCellTuples = _.filter(cellTuples, function(cellTuple){return cellTuple['column'] !== 1 && cellTuple['row'] !== 1});

    // Save the d3 grid selection
    const grid = d3.select('.grid');

    // Create the column header labels
    const columnHeaderLabels = grid.selectAll('.columnHeaderLabel');
    columnHeaderLabels
        .data(columnHeaderTuples)
        .enter()
        .append('div')
            .attr('class', 'columnHeaderLabel')
            .style('grid-column', function(d){return d['column']})
            .style('grid-row', 1)
            .append('p')
                .text(function(d){return d['bizValue']});

    // Create the row header labels
    const rowHeaderLabels = grid.selectAll('.rowHeaderLabel');
    rowHeaderLabels
        .data(rowHeaderTuples)
        .enter()
        .append('div')
            .attr('class', function(d){
                    const parity = (d['row'] % 2 ? 'even' : 'odd');
                    return 'rowHeaderLabel' + ' ' + parity;
                })
            .style('grid-column', 1)
            .style('grid-row', function(d){return d['row']})
            .append('p')
                .text(function(d){return d['userValue']});

    // Create the cell divs containing the labels
    const cells = grid.selectAll('.cell');
    cells
        .data(contentCellTuples)
        .enter()
        .append('div')
            .attr('class', function(d){
                const parity = (d['row'] % 2 ? 'even' : 'odd');
                return 'cell' + ' ' + parity;
            })
            .attr('id', function(d){
                return strip(d['bizValue']) + '-' + strip(d['userValue']);
            })
            .style('grid-column', function(d){return d['column']})
            .style('grid-row', function(d){return d['row']})

    // Create the context buttons
    // Start by selecting the context buttons
    const contextButtons = d3.select('#contextButtonsContainer').selectAll('.contextButtons');
    contextButtons
        .data(contexts)                                                 // Bind data
        .enter()                                                        // Prepare selection set
        .append('button')                                               // Create buttons for everything not in selection set (everything)
            .attr('class', 'btn btn-outline-secondary contextButton')   // Set class (bootstrap + custom)
            .attr('id', function(d){
                return d.replace(/ /g,"-").replace('&','-');            // Give it a unique, sanitized id
            })
            .attr('type', 'button')
            .attr('data-toggle', 'collapse')                            // Add collapse toggle for more info
            .attr('data-target', function(d){
                return '#' + d.replace(/ /g,"-").replace('&','-') + '-Description'; // Give it a collapse target for more info
            })
            .text(function(d){
                return d;                               // Set button text
            })
            .on('click', function(d){
                activeExamples = _.filter(activeExamples, function(example){return example['Context'] === d});
                renderExamples(bizValues, userValues);
            });

    var showOnlyTTC = false;
    const notTTCExamples = document.getElementsByClassName('notTTCExample');
    const ttcButton = document.getElementById('buttonTTC');
    ttcButton.addEventListener('click', function(){
    });

    renderExamples(bizValues, userValues);
};

var renderExamples = function(bizValues, userValues){
    bizValues.forEach(function(bizValue){
        userValues.forEach(function(userValue){
            const id = '#' + strip(bizValue) + '-' + strip(userValue);
            const cell = d3.select(id);

            cellExamples = _.filter(activeExamples, function(example){
                switch (displayMode) {
                    case 'all':
                        primaryFitsColumn = example['Primary Business Value'] === bizValue;
                        otherFitsColumn = _.contains(example['Other Business Values'], bizValue);
                        primaryFitsRow = example['Primary User Value'] === userValue;
                        otherFitsRow = _.contains(example['Other User Values'], userValue);
                        return ((primaryFitsColumn || otherFitsColumn) && (primaryFitsRow || otherFitsRow));
                    case 'primary':
                        primaryFitsColumn = example['Primary Business Value'] === bizValue;
                        primaryFitsRow = example['Primary User Value'] === userValue;
                        return (primaryFitsColumn && primaryFitsRow);
                    case 'highlight':
                        highlightFitsColumn = _.contains(example['Value Intersection'], bizValue);
                        highlightFitsRow = _.contains(example['Value Intersection'], userValue);
                        return (highlightFitsColumn && highlightFitsRow);
                    default:
                        throw new Error('No display mode chosen!');
                        break;
                }
            });

            cellExampleLabels = cell.selectAll('.exampleLabel')
            //console.log(cellExampleLabels.size());
            cellExampleLabels
                .data(cellExamples)
                .enter()
                    .append('p')
                        .attr('class', 'exampleLabel')
                        .text(function(d){return d['Title of product/project']})
                    .on("click", function(d, i){ 
                        showMoreInfo(d); 
                        selectedExamples = document.getElementsByClassName('selectedExample');
                        
                        Array.prototype.forEach.call(selectedExamples, function(selectedExample){
                            selectedExample.classList.remove('selectedExample');
                        });
                        this.classList.add('selectedExample');
                    });

            //console.log(cellExampleLabels.exit().size());
            //cellExampleLabels.exit().remove();
        });
    });
};

var colorButtons = function(contexts, contextColors){
    contexts.forEach(function(context, contextColors){
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

const strip = function(string){
    return string.replace(/ /g,"-").replace('&','-').replace('(', '').replace(')', '');
}

fetchData();