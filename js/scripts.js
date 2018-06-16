const width = window.innerWidth - 50,
    height = window.innerHeight - 300,
    color = d3.scaleOrdinal(d3.schemeCategory20c);

d3.json('data/kickstarter-funding-data.json', function (err, data) {
    if (err) throw err;

    const header = d3.select('.container').append('header');

    header.append('h1')
        .attr('id', 'title')
        .text('Kickstarter Pledges');

    header.append('p')
        .attr('id', 'description')
        .text('Top 100 Most Pledged Kickstarter Campaigns Grouped By Category');


    if (window.innerWidth > 900) {

        const root = d3.hierarchy(data);
        const treemap = d3.treemap();
        treemap.size([width - 170, height]);

        root.sum(d => d.value);

        treemap(root);

        const svg = d3.select('.container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const nodes = svg.selectAll('g')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

        nodes
            .append('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('class', 'tile')
            .attr('fill', d => d.children ? null : color(d.data.category));

        d3.selectAll('.tile')
            .attr('data-name', d => d.data.name)
            .attr('data-category', d => d.data.category)
            .attr('data-value', d => d.data.value)
            .on('mouseover, mousemove', function (e) {
                d3.select('#name').text(e.data.name);
                d3.select('#category').text(e.data.category);
                d3.select('#value').text(formatter.format(e.data.value));

                const dimensions = document.querySelector('#tooltip').getBoundingClientRect();

                d3.select('#tooltip')
                    .attr('data-value', e.value)
                    .style('left', d3.event.pageX - dimensions.width / 2 - 3 + 'px')
                    .style('top', d3.event.pageY - dimensions.height - 20 + 'px')
                    .style('opacity', 1)
                    .classed('hidden', false);

            })
            .on('mouseout', function (e) {
                d3.select('#tooltip')
                    .style('opacity', 0);

            });

        nodes.append('foreignObject')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('x', 0)
            .attr('y', 0)
            .append('xhtml:div')
            .attr('class', 'title')
            .text(d => d.data.name);

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        });

        const categoriesArray = root.leaves().map(d => d.data.category);
        const categories = [...new Set(categoriesArray)];

        const legend = svg.append('g')
            .attr('id', 'legend');

        const legendItem = legend.selectAll('.legend-item')
            .data(categories)
            .enter()
            .append('g');

        legendItem
            .append('rect')
            .attr('class', 'legend-item')
            .attr('x', width - 150)
            .attr('fill', d => color(d))
            .attr('y', (d, i) => i * 30 + (height - categories.length * 30) / 2)
            .attr('width', 20)
            .attr('height', 20);

        legendItem.append('text')
            .attr('x', 25)
            .attr('y', 15 + (height - categories.length * 30) / 2)
            .attr('class', 'legend-text')
            .attr('transform', (d, i) => `translate(${width - 150}, ${ i * 30})`)
            .text(d => d);


    } else {

        const message = d3.select('.container').append('div').attr('class', 'message');
        message.append('h2').text('Whoops!');
        message.append('h3').text('This site has been optimized to watch on 900px+ width screen size!');

    }

    d3.select('.container')
        .append('footer')
        .html('<a href="https://www.dcmf.hu" target="_blank"><span>codedBy</span><img src="https://www.dcmf.hu/images/dcmf-letters.png" alt="dcmf-logo" /></a>');

});