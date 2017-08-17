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
    // fetch('http://localhost:22222/api/distribution', {
      method: 'GET'
    }).then(res => res.json()
    ).then(res => {
      this.supplyTotal = res.total;
      res.distribution.forEach(d => {
        this.supplySubjects[d.subject] = d.value;
      });

      this.catalogTotal = res.total;
      this.catalogDistribution = res.distribution.slice(0, NUM_TO_SHOW);
      this.initializeGraph();
    }).catch(err => {
      console.error(err);
    });
  }

  initializeGraph() {
    this.svg = d3.select('#distribution').select('svg');
    this.tip = d3.tip().attr('class', 'd3-tip');

    this.tip
      .offset(function() {
        return [this.getBBox().height/2, 0]
      })
      .html(function(d) { return `
        <div>
          <div>${d.subject}</div>
          <div>Catalog: ${d.value}</div>
          <div>Search: ${d.valueRealtime}</div>
        </div>`; });


    this.barWidth = 1000 / this.catalogDistribution.length;

    this.groups = this.svg.selectAll('g')
      .data(this.catalogDistribution)
      .enter()
      .append('g')
      .attr('transform', (d, i) => {
        return 'translate(' + i*this.barWidth  +', 0)';
      })
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide);

    this.groups.append('rect')
      .classed('catalog', true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0.5*this.barWidth)
      .attr('height', 0)
      .style('fill', '#F80');

    this.groups.append('rect')
      .classed('realtime', true)
      .attr('x', 0.5*this.barWidth)
      .attr('y', 0)
      .attr('width', 0.5*this.barWidth)
      .attr('height', 0)
      .style('fill', '#369');

    this.groups.call(this.tip);

  }

  update(realtimeData) {
    this.realtimeTotal = realtimeData.total;


    this.groups.each( g => {
      let tmp = realtimeData.distribution.filter( d => d.subject === g.subject );
      if (tmp.length > 0) {
        g.valueRealtime = tmp[0].value;
      } else {
        g.valueRealtime = 0;
      }
    })


    const max1 = d3.max( this.groups.data().map(d => d.value / this.catalogTotal ));
    const max2 = d3.max( this.groups.data().map(d => d.valueRealtime / realtimeData.total));
    const max = d3.max([max1, max2])
    const scale = d3.scaleLinear().domain([0, max]).range([0, 200]);

    this.groups.selectAll('.catalog')
      .transition()
      .duration(150)
      .attr('y', d => {
        return 200 - scale(d.value / this.catalogTotal)
      })
      .attr('height', d => {
        return scale(d.value / this.catalogTotal);
      });

    this.groups.selectAll('.realtime')
      .transition()
      .duration(150)
      .attr('y', d=> {
        return 200 - scale(d.valueRealtime / this.realtimeTotal)
      })
      .attr('height', d=> {
        return scale(d.valueRealtime / this.realtimeTotal);
      });

    /*
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
      */
  }
}
