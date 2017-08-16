/* global d3 */

import {distributionData} from '../mock-data/distribution-data';

const HEIGHT = 300;
const BAR_WIDTH = 30;

function getHexHashValue(str) {
  let ch;
  let hash = 0;
  for (let i = 0; i < str.length; ++i) {
    ch = str.charCodeAt(i);
    hash = (hash << 8) + ch;
  }

  return (hash % Math.pow(16, 6)).toString(16);
}

export default class DistributionGraphComponent {

  svg = null;
  total = 0;

  getYValue = (d) => d.value / this.total * 10000;

  constructor() {
    console.log('DistributionGraphComponent.init');
    this.initializeGraph();
  }

  initializeGraph() {
    this.svg = d3.select('#graph')
      .append('svg')
      .attr('class', 'svg');

    this.update(distributionData);
  }

  update(distrData) {
    this.total = distrData.total;
    const data = distrData.distribution;

    const x = d3.scaleOrdinal(data.map(function (d, i) { return i * BAR_WIDTH; }))
      .domain(data.map(function(d) { return d.subject; }));
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, this.getYValue)]);

    /*const xAxis = d3.axisBottom(this.x);
    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, 10)')
      .call(xAxis);*/

    this.svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.subject))
        .attr("width", BAR_WIDTH)
        .attr("y", (d) => HEIGHT - this.getYValue(d))
        .attr("height", this.getYValue)
        .style('fill', (d) => `#${getHexHashValue(d.subject)}`);
  }
}
