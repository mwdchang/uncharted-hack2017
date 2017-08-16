/* global d3 */

const HEIGHT = 600;
const BAR_WIDTH = 30;
const NUM_TO_SHOW = 20;

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
  supplyTotal = 0;
  supplySubjects = {};

  getSupplyHeight = (d) => {
    if (d.supply === 'none' || this.supplyTotal === 0) {
      return 0;
    } else {
      return d.supply * HEIGHT;
    }
  };

  getDemandHeight = (d) => {
    return this.demandTotal === 0 ? 0 : d.demand * HEIGHT;
  }

  getMax = (d) => {
    return Math.max(d.demand || 0, Number(d.supply) || 0);
  }

  constructor() {
    fetch('http://10.64.16.97:22222/api/distribution', {
      method: 'GET'
    }).then(res => res.json()
    ).then(res => {
      this.supplyTotal = res.total;
      res.distribution.forEach(d => {
        this.supplySubjects[d.subject] = d.value;
      });
      this.initializeGraph();
    }).catch(err => {
      console.error(err);
    });
  }

  initializeGraph() {
    this.svg = d3.select('#graph')
      .append('svg')
      .attr('class', 'svg');
    this.tip = d3.tip()
      .attr('class', 'd3-tip');
  }

  update(realtimeData) {
    const data = realtimeData.distribution.map(demand => {
      const obj = {
        subject: demand.subject,
        demand: demand.value / realtimeData.total
      };
      if (this.supplySubjects[demand.subject]) {
        obj.supply = this.supplySubjects[demand.subject] / this.supplyTotal;
      } else {
        obj.supply = 'none';
      }
      return obj;
    }).slice(0, NUM_TO_SHOW);

    const x = d3.scaleOrdinal(data.map(function (d, i) { return i * BAR_WIDTH; }))
      .domain(data.map(function(d) { return d.subject; }));
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, this.getMax)]);

    this.svg.selectAll('*').remove();

    this.tip
      .offset(function() {
        return [this.getBBox().height/2, 0]
      })
      .html(function(d) { return `
        <div>
          <div>${d.subject}</div>
          <div>Demand: ${d.demand}</div>
          <div>Supply: ${d.supply}</div>
        </div>`; });

    let group = this.svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', 'translate(0, -300)');

    group.call(this.tip);
    group.on('mouseover', this.tip.show)
         .on('mouseout', this.tip.hide);

    group.append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.subject))
      .attr('width', BAR_WIDTH/2 - 3)
      .attr('y', d => HEIGHT - this.getDemandHeight(d))
      .attr('height', this.getDemandHeight)
      .attr('fill', 'red');

    group.append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.subject) + (BAR_WIDTH/2 - 3))
      .attr('width', BAR_WIDTH/2 - 3)
      .attr('y', d => HEIGHT - this.getSupplyHeight(d))
      .attr('height', this.getSupplyHeight)
      .attr('fill', 'blue');
  }
}
