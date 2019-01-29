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
                    .attr('class', function(d, i){
                        if (i % 2 == 0) {
                            return 'primaryPurposeLabel odd';
                        } else {
                            return 'primaryPurposeLabel even';
                        }
                    })
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
            if (ip % 2 == 0) {
                cell.classList.add('odd')
            } else {
                cell.classList.add('even')
            }

            document.getElementsByClassName('grid')[0].appendChild(cell)

            d3.select(cell).selectAll('.exampleLabel')
                .data(contextAndPrimaryPurposeExamples)
                .enter()
                .append('p')
                    .attr('class', 'exampleLabel')
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
                });
        });
    });
};

var colorButtons = function(themes){
    themes.forEach(function(theme){
        theme = theme.replace(/ /g,"-");
        var css = '';
        switch(theme) {
            case 'AR-Presentation':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[0]);
                break;
            case 'AR-Catalog':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[1]);
                break;
            case 'AR-Try-on':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[2]);
                break;
            case 'Digital-Fit-Determination':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[3]);
                break;
            case 'VR-Catalog':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[4]);
                break;
            case 'Appealing-to-the-Senses':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[5]);
                break;
            case 'Virtual-Preview':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[6]);
                break;
            case 'AR-More-Info':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[7]);
                break;
            case 'Attract-Through-AR':
                css = generateActiveButtonCSS(theme, d3.schemePastel1[8]);
                break;
            case 'Grab-Attention':
                css = generateActiveButtonCSS(theme, d3.schemePastel2[0]);
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
    const css = '#' + theme + '.active, ' + '#' + theme + ':hover {' +
                    'background-color: ' + color + ' !important;' +
                '}'
    return css;
};

var openModal = function(){

};


fetchData();