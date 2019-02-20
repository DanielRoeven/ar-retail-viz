var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keyBoUtj67XZsejy7' }).base('appCQJs47j3IvmonX');
var allExamples = [];
var contentCellTuples = [];
var contextFilters = [];
var inputFilters = [];
var contentFilters = [];
var typeOfMRFilters = [];
var outputFilters = [];
var interactionStyleFilters = [];
var creatorsFilters = [];
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
            renderFramework();
        }
    });   
};

// Plot examples we retrieved from Airtable
var renderFramework = function(){

    // Make a list of biz values:
    // Take predetermined (hardcoded) biz values for standard order
    // Map all examples to array with only the field primary biz value
    // Map all examples to array with only the field other biz values and flatten it
    // Then make join arrays, make unique, and remove undefined
    const predeterminedBizValues = ['Awareness', 'Engagement', 'Conversion', 'Loyalty'];
    const primBizValues = allExamples.map(example => example['Primary Business Value']);
    const otherBizValues = _.flatten(allExamples.map(example => example['Other Business Values']));
    const bizValues = _.without(_.uniq(_.union(predeterminedBizValues, primBizValues, otherBizValues)), undefined);

    // Create list of biz values with header element at beginning
    const bizValuesWithHeader = bizValues.slice();
    bizValuesWithHeader.unshift('Row Header');

    // Make a list of user values:
    // Map all examples to array with only the field primary user value
    // Map all examples to array with only the field other user values and flatten it
    // Then make join arrays, make unique, and remove undefined
    const predeterminedUserValues = ['Appropriateness',
                                    'Physical Compatibility',
                                    'Accessibility',
                                    'Time Management',
                                    'Fun',
                                    'Purchase Economy',
                                    'Avoidance of Sensory Unpleasantness',
                                    'Impression Management',
                                    'Group Belongingness'];
    const primUserValues = allExamples.map(example => example['Primary User Value']);
    const otherUserValues = _.flatten(allExamples.map(example => example['Other User Values']));
    const userValues = _.without(_.uniq(_.union(predeterminedUserValues, primUserValues, otherUserValues)), undefined);
    
    // Create copy of list of user values with header element at beginning
    const userValuesWithHeader = userValues.slice();
    userValuesWithHeader.unshift('Column Header')
    
    // Make a unique lists of categories
    contexts = _.uniq(allExamples.map(example => example['Context']));
    interactionStyles = _.without(_.uniq(allExamples.map(example => example['Interaction Style'])), undefined);
    inputs = _.without(_.uniq(_.flatten(allExamples.map(example => example['MR Input']))), undefined);
    contents = _.without(_.uniq(_.flatten(allExamples.map(example => example['Content']))), undefined);
    typesOfMR = _.without(_.uniq(_.flatten(allExamples.map(example => example['Type of MR']))), undefined);
    console.log(typesOfMR)
    outputs = _.without(_.uniq(_.flatten(allExamples.map(example => example['Output']))), undefined);

    // Make cell Tuples
    const cellTuples = makeCellTuples(bizValuesWithHeader, userValuesWithHeader);
    const columnHeaderTuples = _.filter(cellTuples, function(cellTuple){return cellTuple['row'] === 1});
    const rowHeaderTuples = _.filter(cellTuples, function(cellTuple){return cellTuple['column'] === 1});
    contentCellTuples = _.filter(cellTuples, function(cellTuple){
        return cellTuple['column'] !== 1 && cellTuple['row'] !== 1
    });
    
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

    // Make filter dropdowns
    makeFilterDropdown('#contextDropdown', contexts, 'Context');
    makeFilterDropdown('#inputDropdown', inputs, 'Input');
    makeFilterDropdown('#contentDropdown', contents, 'Content');
    makeFilterDropdown('#typeOfMRDropdown', typesOfMR, 'Type of MR');
    makeFilterDropdown('#outputDropdown', outputs, 'Output');
    makeFilterDropdown('#interactionStyleDropdown', interactionStyles, 'Interaction Style');

    // Make the TTC filter button
    const ttcButton = d3.select('#ttcButton');
    ttcButton.on('click', function(){
        creatorsFilters = toggle(creatorsFilters, 'The Techno Creatives')
        filterContentCellTuples();
    });

    filterContentCellTuples();
};

var makeFilterDropdown = function(id, options, name){
    const optionElements = d3.select(id).selectAll('option');
    optionElements
        .data(options)
        .enter()
        .append('option')
            .text(function(d){return d})
            .attr('value', function(d){
                return d;
            })

    $(id).multiselect({
        buttonClass: 'btn btn-outline-secondary ' + id,
        buttonText: function(){return name},
        onChange: function(option){
            toggleFilters(name, $(option).val());
            filterContentCellTuples();
        }
    });
};

var makeCellTuples = function(bizValuesWithHeader, userValuesWithHeader){
    // Create flattened matrix with index tuples for cells
    var cellTuples = [];
    bizValuesWithHeader.forEach(function(bizValue, bizValueIndex){
        userValuesWithHeader.forEach(function(userValue, userValueIndex){
            // const cellExamples = _.filter(allExamples, function(example){
            //     const primaryFitsColumn = example['Primary Business Value'] === bizValue;
            //     const otherFitsColumn = _.contains(example['Other Business Values'], bizValue);
            //     const primaryFitsRow = example['Primary User Value'] === userValue;
            //     const otherFitsRow = _.contains(example['Other User Values'], userValue);
            //     return ((primaryFitsColumn || otherFitsColumn) && (primaryFitsRow || otherFitsRow));
            // })

            var cellExamples = [];
            allExamples.forEach(function(sourceExample){    
                
                var example = _.clone(sourceExample);
                
                const highlightFitsColumn = _.contains(example['Value Intersection'], bizValue);
                const primaryFitsColumn = example['Primary Business Value'] === bizValue;
                const otherFitsColumn = _.contains(example['Other Business Values'], bizValue);
                
                const highlightFitsRow = _.contains(example['Value Intersection'], userValue);
                const primaryFitsRow = example['Primary User Value'] === userValue;
                const otherFitsRow = _.contains(example['Other User Values'], userValue);
                
                if (highlightFitsColumn && highlightFitsRow) {
                    example.valueHighlight = 1;
                }

                if (primaryFitsColumn && primaryFitsRow) {
                    example.relevance = 1;
                }
                else if ((primaryFitsColumn && otherFitsRow) || (otherFitsColumn && primaryFitsRow)) {
                    example.relevance = .31;
                }
                else if (otherFitsColumn && otherFitsRow) {
                    example.relevance = .3;
                }
                else {
                    example.relevance = 0;
                }

                if (example.relevance > 0) {
                    cellExamples.push(example);
                }
            });
            const column = bizValueIndex + 1;
            const row = userValueIndex + 1;
            const cellTuple = {bizValue, column, userValue, row, cellExamples, selectedExamples: cellExamples, expanded: false}
            cellTuples.push(cellTuple);
        });
    });

    // Remove header/header tuple, maybe replace with axis labels?
    cellTuples.shift();
    return cellTuples;
}

var filterContentCellTuples = function(){
    contentCellTuples.forEach(function(cellTuple){

        cellTuple.selectedExamples = cellTuple.cellExamples;

        const activeFiltersCount = contextFilters.length +
                                    inputFilters.length +
                                    contentFilters.length +
                                    typeOfMRFilters.length +
                                    outputFilters.length +
                                    interactionStyleFilters.length +
                                    creatorsFilters.length;
        if (activeFiltersCount == 0) {
            cellTuple.selectedExamples = cellTuple.cellExamples;
        }
        else {
            cellTuple.selectedExamples = cellTuple.cellExamples;

            // Filter on context
            cellTuple.selectedExamples =  _.filter(cellTuple.selectedExamples, function(example){
                if (contextFilters.length == 0) {
                    return true;
                } else {
                    return _.contains(contextFilters, example['Context']);
                }
            });

            // Filter on input
            cellTuple.selectedExamples =  _.filter(cellTuple.selectedExamples, function(example){
                if (inputFilters.length == 0) {
                    return true;
                } else {
                    return _.intersection(inputFilters, example['MR Input']).length > 0;
                }
            });

            // Filter on content
            cellTuple.selectedExamples =  _.filter(cellTuple.selectedExamples, function(example){
                if (contentFilters.length == 0) {
                    return true;
                } else {
                    return _.intersection(contentFilters, example['Content']).length > 0;
                }
            });

            // Filter on type of MR
            cellTuple.selectedExamples =  _.filter(cellTuple.selectedExamples, function(example){
                if (typeOfMRFilters.length == 0) {
                    return true;
                } else {
                    return _.contains(typeOfMRFilters, example['Type of MR']);
                }
            });

            // Filter on output
            cellTuple.selectedExamples =  _.filter(cellTuple.selectedExamples, function(example){
                if (outputFilters.length == 0) {
                    return true;
                } else {
                    return _.intersection(outputFilters, example['Output']).length > 0;
                }
            });

            // Filter on interaction style
            cellTuple.selectedExamples =  _.filter(cellTuple.selectedExamples, function(example){
                if (interactionStyleFilters.length == 0) {
                    return true;
                } else {
                    return _.contains(interactionStyleFilters, example['Interaction Style']);
                }
            });

            // Filter on creators
            cellTuple.selectedExamples = _.filter(cellTuple.selectedExamples, function(example){
                if (creatorsFilters.length == 0) {
                    return true;
                } else {
                    return _.contains(creatorsFilters, example['Creators']);
                }
            });
        }
        
        cellTuple.selectedExamples = _.sortBy(cellTuple.selectedExamples, function(example){
            if (example.valueHighlight) {
                return 0;
            } else {
                return 2 - example.relevance;
            }
        });
    });

    renderExamples();
}

var renderExamples = function() {
    contentCellTuples.forEach(function(cellTuple){
        const id = '#' + strip(cellTuple.bizValue) + '-' + strip(cellTuple.userValue);
        const cell = d3.select(id);
        
        var cellData = [];

        if (cellTuple.expanded) {
            cellData = cellTuple.selectedExamples;
        } else if (cellTuple.selectedExamples.length > 0) {
            cellData.push(cellTuple.selectedExamples[0]);
        }
        var exampleLabels = cell.selectAll('.exampleLabel');
        var selection = exampleLabels.data(cellData);
        
        selection.exit().remove();
        
        selection.enter()
            .append('p')
            .merge(selection)
                .attr('class', 'exampleLabel')
                .style('background-color', function(d){
                    return 'hsla(0, 0%, 75%, ' + d.relevance + ')';
                })
                .text(function(d){return d['Title of product/project']})
                .on("click", function(d, i){ 
                    showMoreInfo(d); 
                    selectedExamples = document.getElementsByClassName('selectedExample');

                    Array.prototype.forEach.call(selectedExamples, function(selectedExample){
                        selectedExample.classList.remove('selectedExample');
                    });
                    this.classList.add('selectedExample');
                })

        if (cellTuple.showMoreButton) {
            cellTuple.showMoreButton.remove();
        }
        if (cellTuple.selectedExamples.length > 1) {
            cell.append('button')
                .attr('class', 'showMoreButton')
                .text(function(d){
                    return cellTuple.expanded ? 'show less' : 'show more';
                })
                .on('click', function(d){
                    cellTuple.expanded ? cellTuple.expanded = false : cellTuple.expanded = true;
                    renderExamples();
                });
            cellTuple.showMoreButton = cell.select('.showMoreButton');
        }
    });
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

const toggleFilters = function(name, value){
    switch (name) {
        case 'Context':
            contextFilters = toggle(contextFilters, value);
            break;
        case 'Input':
            inputFilters = toggle(inputFilters, value);
            break;
        case 'Content':
            contentFilters = toggle(contentFilters, value);
            break;
        case 'Type of MR':
            typeOfMRFilters = toggle(typeOfMRFilters, value);
            break;
        case 'Output':
            outputFilters = toggle(outputFilters, value);
            break;
        case 'Interaction Style':
            interactionStyleFilters = toggle(interactionStyleFilters, value);
            break;
        default:
            throw new Error('Not a valid filter array!');
            break;
    }
}

const toggle = function(array, value){
    if (_.contains(array, value)){
        return _.without(array, value);
    }
    else {
        return _.union(array, [value]);
    }
    console.log(array);
}

$(document).ready(function() {
    fetchData();
});