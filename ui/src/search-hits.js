/* global d3  */

export default class SearchHits {

  constructor(target) {
    this.history = [];
    this.max = 20;

    for (let i=0; i <= this.max; i++) {
      this.history.push({
        value: 0
      })
    }
    this.target = target;

    this.barWidth = 1000 / (this.max+1);
    this.padding = 2;
    this.init();
  }

  init() {
    this.svg = d3.select('#' + this.target).select('svg');
    let svg = this.svg;

    let bars = svg.selectAll('g')
      .data(this.history)
      .enter()
      .append('g')
      .attr('transform', (d, i) => {
        return 'translate(' + i*this.barWidth + ', 0)';
      });




    console.log('!!!', this.barWidth)
    let tip = d3.tip().attr('class', 'd3-tip')
      .offset(function() {
        return [this.getBBox().height/2, 0]
      })
      .html(function(d) { return d.value; });
    bars.call(tip);
    bars.append('rect')
      .classed('bar', true)
      .attr('x', this.padding)
      .attr('y', 200)
      .attr('width', this.barWidth - 2*this.padding)
      .attr('height', 0)
      .style('fill', '#369')
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    svg.append('rect')
      .attr('x', 0)
      .attr('y', 198)
      .attr('width', 1000)
      .attr('height', 2)
      .style('fill', '#333')
  }

  update(searchResult) {
    let matches = searchResult.matches.length;
    this.history[+matches].value ++;
    this.updateRender();
  }

  updateRender() {
    let svg = this.svg;
    let max = d3.max(this.history.map(d=>d.value));
    let scale = d3.scaleLinear().domain([0, max]).range([0, 200]);

    // console.log(this.history);
    svg.selectAll('.bar')
      .transition()
      .duration(150)
      .attr('y', d=> {
        return 200 - scale(d.value)
      })
      .attr('height', d=> {
        return scale(d.value);
      });
  }


}
