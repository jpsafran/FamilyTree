// d3-layout.js

function renderTree() {
  const svg = d3.select("#tree-svg");
  svg.selectAll("*").remove();

  // Draw relationship lines
  relationships.forEach(rel => {
    const nodeA = familyMembers.find(m => m.id === rel.from);
    const nodeB = familyMembers.find(m => m.id === rel.to);
    if (!nodeA || !nodeB) return;

    const line = svg.append("line")
      .attr("x1", nodeA.x == null ? 300 : nodeA.x)
      .attr("y1", nodeA.y == null ? 300 : nodeA.y)
      .attr("x2", nodeB.x == null ? 500 : nodeB.x)
      .attr("y2", nodeB.y == null ? 300 : nodeB.y)
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    if (rel.type === 'spouse') {
      line.attr('stroke-dasharray', '4,2');
    }
  });

  // Draw persons
  const nodesSelection = svg.selectAll('.person-node')
    .data(familyMembers, d => d.id)
    .enter()
    .append('g')
    .attr('class', 'person-node')
    .attr('transform', d => {
      if (d.x == null) d.x = Math.random()*600 + 100;
      if (d.y == null) d.y = Math.random()*400 + 100;
      return `translate(${d.x},${d.y})`;
    })
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded)
    );

  nodesSelection.append('circle')
    .attr('r', 25)
    .attr('fill', '#3498db');

  nodesSelection.append('text')
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', '#fff')
    .text(d => d.name);
}

function dragStarted(event, d) {
  d3.select(this).raise().classed('active', true);
}

function dragged(event, d) {
  d.x = event.x;
  d.y = event.y;
  d3.select(this).attr('transform', `translate(${d.x},${d.y})`);
}

function dragEnded(event, d) {
  d3.select(this).classed('active', false);
  saveData(); // save updated position
  renderTree(); // re-render lines
}
