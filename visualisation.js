var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keyBoUtj67XZsejy7' }).base('appCQJs47j3IvmonX');

// Get data from Airtable
var fetchData = function(){
    // Create array to load in examples
    var examples = [];

    // Get all the records from the Examples table in Airtable
    base('Examples').select({
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

    // Make a list of primary purposes:
    // Map all examples to array with only the field primary purpose
    // Then make array unique, stripping out duplicate primary purposes
    const primaryPurposes = _.uniq(examples.map(example => example['Primary Purpose']));
    
    // Make a list of contexts:
    // Map all examples to array with only the field context
    // Then make array unique, stripping out duplicate contexts
    const contexts = _.uniq(examples.map(example => example['Context']));

    // Make a list of themes:
    // Map all examples to array with only the field theme
    // Then make array unique, stripping out duplicate contexts
    const themes = _.uniq(examples.map(example => example['Theme']));
    // Save list of themes to show
    var themesToShow = _.uniq(examples.map(example => example['Theme']));;

    // Give the theme filter buttons a color
    colorButtons(themes);

    // Make d3 look at the div with a css grid
    const grid = d3.select('.grid');

    // Create the primary purpose labels
    // Start by selecting all the existing primary purpose labels (none) so selection set is empty
    const primaryPurposeLabels = grid.selectAll('.primaryPurposeLabel');
    primaryPurposeLabels
        .data(primaryPurposes)                          // Bind the data
        .enter()                                        // Prepare selection set
        .append('div')                                  // Create a div for everything not in selection set (everything)
            .attr('class', function(d, i){              // Set classes to primaryPurposeLabel and odd/even for zebra stripes
                if (i % 2 == 0) {
                    return 'primaryPurposeLabel odd';
                } else {
                    return 'primaryPurposeLabel even';
                }
            })
            .style('grid-column', 1)                    // Labels are all in the first column
            .style('grid-row', function(d, i){          // Rows start at 2 (+1 because index starts at 0 but css grid at 1, +1 because top row is other labels)
                return i+2;
            })
                .append('p')                            // Create paragraph inside div
                    .text(function(d){                  // Set text to data (primary purpose name)
                        return d;
                    });

    // Create the context labels
    // Start by selecting all the context labels (none) so the selection set is empty
    const contextLabels = grid.selectAll('.contextLabel');
    contextLabels
        .data(contexts)                                 // Bind the data
        .enter()                                        // Prepare selection set
        .append('div')                                  // Create a div for everything not in selection set (everything)
            .attr('class', 'contextLabel')              // Set class to context label
            .style('grid-column', function(d, i){       // Columns start at 2 (+1 because index start at 0 but css grid at 1, +1 because first column is other labels)
                return i+2;
            })
            .style('grid-row', 1)                       // Labels are all in first column
            .append('p')                                // Create paragraph inside div
                .text(function(d){                      // Set text to data (context name)
                    return d;
                });

    const themeButtonsContainer = d3.select('#themeButtonsContainer');
    const themeButtons = themeButtonsContainer.selectAll('.buttonthemes');
    themeButtons
        .data(themes)
        .enter()
        .append('button')
            .attr('class', 'btn btn-outline-secondary buttonthemes')
            .attr('id', function(d){
                return d.replace(/ /g,"-");
            })
            .attr('type', 'button')
            .attr('data-toggle', 'collapse')
            .attr('data-target', function(d){
                return '#' + d.replace(/ /g,"-") + '-Description';
            })
            .text(function(d){
                return d;
            })
            .on('click', function(d){
                // Create classnname for theme examples without spaces
                themeClassName = d.replace(/ /g,"-") + '-Example';

                if (themesToShow.length == 10) {
                    // If all themes are shown, hide all

                    // Themes to show is empty
                    themesToShow = [];

                    // Get all example labels
                    const examplesToHide = document.getElementsByClassName('exampleLabel');

                    // Hide all example labels
                    Array.prototype.forEach.call(examplesToHide, function(example){
                        example.classList.add('hidden');
                    });
                }

                if (_.contains(themesToShow, d)) {
                    // Hide theme

                    // If theme is in list of themes to show, remove it
                    themesToShow = _.without(themesToShow, d)

                    // Find the example labels for this theme
                    const exampleLabels = document.getElementsByClassName(themeClassName);

                    // Hide them
                    Array.prototype.forEach.call(exampleLabels, function(example){
                        example.classList.add('hidden');
                    });
                } else {
                    // Show theme

                    // If theme is not in list of themes to show, add it
                    themesToShow.push(d);

                    // Find the example labels for this theme
                    const exampleLabels = document.getElementsByClassName(themeClassName);

                    // Unhide (show) them
                    Array.prototype.forEach.call(exampleLabels, function(example){
                        example.classList.remove('hidden');
                    });
                }
            })

    fillGrid(contexts, primaryPurposes, examples, themesToShow);
};

var fillGrid = function(contexts, primaryPurposes, examples){

    contexts.forEach(function(context, ic){
        const contextExamples = _.filter(examples, function(contextExample){
            return contextExample.Context === context;
        });

        primaryPurposes.forEach(function(primaryPurpose, ip){
            const contextAndPrimaryPurposeExamples = _.filter(contextExamples, function(contextAndPrimaryPurposeExample){
              return contextAndPrimaryPurposeExample['Primary Purpose'] === primaryPurpose;
            });

            var cell = document.createElement('div')
            cell.style['grid-column'] = (ic + 2);
            cell.style['grid-row'] = (ip + 2);
            cell.classList.add('cell');
            if (ip % 2 == 0) {
                cell.classList.add('odd')
            } else {
                cell.classList.add('even')
            }

            document.getElementsByClassName('grid')[0].appendChild(cell);

            selection = d3.select(cell).selectAll('.exampleLabel').data(contextAndPrimaryPurposeExamples);
            selection.enter()
                .append('p')
                    .attr('class', function(d){
                        const themeNoSpaces = d['Theme'].replace(/ /g,"-");
                        return 'exampleLabel ' + themeNoSpaces + '-Example';
                    })
                    .text(function(d){return d['Title of product/project']})
                    // .style('border-width', '2px')
                    // .style('border-style', 'solid')
                    .style('background-color', function(d){
                        switch(d['Theme']) {
                            case 'AR Presentation':
                                return d3.schemePastel1[0];
                            case 'AR Catalog':
                                return d3.schemePastel1[1];
                            case 'AR Try-on':
                                return d3.schemePastel1[2];
                            case 'Digital Fit Determination':
                                return d3.schemePastel1[3];
                            case 'VR Catalog':
                                return d3.schemePastel1[4];
                            case 'Appealing to the Senses':
                                return d3.schemePastel1[5];
                            case 'Virtual Preview':
                                return d3.schemePastel1[6];
                            case 'AR More Info':
                                return d3.schemePastel1[7];
                            case 'Attract Through AR':
                                return d3.schemePastel1[8];
                            case 'Grab Attention':
                                return d3.schemePastel2[0];
                            default:
                                console.log(d['Theme'])
                                throw new Error('Theme does not exist!');
                        };
                    })
                .on("click", function(d){ 
                    showMoreInfo(d); 
                    d3.select(this).classed('selected', d3.select(this).classed("selected") ? false : true);
                })
        });
    });
};

var colorButtons = function(themes){
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

    themes.forEach(function(theme, i){
        const themeNoSpaces = theme.replace(/ /g,"-");
        const css = generateActiveButtonCSS(themeNoSpaces, colors[i]);

        const styleEl = document.createElement('style');
        document.head.appendChild(styleEl);
        const styleSheet = styleEl.sheet;
        styleSheet.insertRule(css);
    });
};

var generateActiveButtonCSS = function(theme, color) {
    const css = '#' + theme + '.active, ' + '#' + theme + ':hover {' +
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