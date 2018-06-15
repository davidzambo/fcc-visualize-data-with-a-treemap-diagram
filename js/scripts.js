const width = window.innerWidth - 50,
    height = window.innerHeight - 200,
    color = d3.scaleOrdinal(d3.schemeCategory10);

d3.json('data/kickstarter-funding-data.json', function(err, data){
    if (err) throw err;

    const root = d3.hierarchy(data);
    const treemap = d3.treemap();
    treemap.size([width, height]);

    root.sum(d => d.value);

    treemap(root);

    d3.select('.container')
        .append('h1')
        .attr('id', 'title')
        .text('Kickstarter Pledges');

    d3.select('.container')
        .append('p')
        .attr('id', 'description')
        .text('Top 100 Most Pledged Kickstarter Campaigns Grouped By Category')

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
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('class', 'tile')
        .attr('fill', d => d.children ? null : color(d.data.category));

    d3.selectAll('.tile')
        .on('mouseover, mousemove', function(e){
            d3.select('#name').text(e.data.name);
            d3.select('#category').text(e.data.category);
            d3.select('#value').text(formatter.format(e.data.value));

            const dimensions = document.querySelector('#tooltip').getBoundingClientRect();

            d3.select('#tooltip')
                .style('left', d3.event.pageX - dimensions.width / 2  - 3 + 'px')
                .style('top', d3.event.pageY - dimensions.height - 20 + 'px')
                .style('opacity', 1)
                .classed('hidden', false);

        })
        .on('mouseout', function(e){
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
        .text( d => d.data.name);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    });

});