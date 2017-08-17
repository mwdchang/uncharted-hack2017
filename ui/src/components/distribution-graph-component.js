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
  height = 100;

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
    this.tip2 = d3.tip().attr('class', 'd3-tip');

    this.tip
      .offset(function() {
        return [this.getBBox().height/2, 0]
      })
      .html(d =>  { return `
        <div>
          <div>${d.subject}</div>
          <div>Catalog: ${d.value} / ${this.catalogTotal} </div>
          <div>Search: ${d.valueRealtime} / ${this.realtimeTotal} </div>
        </div>`; });


    this.tip2
      .offset(function() {
        return [this.getBBox().height/2, 0]
      })
      .html(d =>  { return `
        <div>
          <div>${d.subject}</div>
          <div>Search: ${d.valueRealtime} / ${this.realtimeTotal} </div>
        </div>`; });


    this.barWidth = 1000 / this.catalogDistribution.length;

    this.groups = this.svg.selectAll('.g1')
      .data(this.catalogDistribution)
      .enter()
      .append('g')
      .classed('g1', true)
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


    let tmp = [];
    for (let i=0; i < 100; i++) tmp.push({});
    this.groups2 = this.svg.selectAll('.g2')
      .data(tmp)
      .enter()
      .append('g')
      .classed('g2', true)
      .attr('transform', (d, i) => {
        return 'translate(' + i*10  +', 50)';
      })
      .on('mouseover', this.tip2.show)
      .on('mouseout', this.tip2.hide);

    this.groups2.append('rect')
      .attr('x', 1)
      .attr('y', 0)
      .attr('width', 8)
      .attr('height', 0)
      .style('fill', '#669');


    this.groups.call(this.tip);
    this.groups2.call(this.tip2);
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

    this.groups2.each( (g, i) => {
      if (i > realtimeData.distribution.length -1) {
        g.valueRealtime = 0;
        g.subject = '';
      } else {
        g.valueRealtime = realtimeData.distribution[i].value;
        g.subject = realtimeData.distribution[i].subject;
      }
    })

    const max1 = d3.max( this.groups.data().map(d => d.value / this.catalogTotal ));
    const max2 = d3.max( this.groups.data().map(d => d.valueRealtime / realtimeData.total));
    const max = d3.max([max1, max2])
    const scale = d3.scaleLinear().domain([0, max]).range([this.height*0.5, this.height]);


    this.groups.selectAll('.catalog')
      .transition()
      .duration(150)
      .attr('y', d => {
        return this.height - scale(d.value / this.catalogTotal)
      })
      .attr('height', d => {
        return scale(d.value / this.catalogTotal) - 0.5*this.height;
      });

    this.groups.selectAll('.realtime')
      .transition()
      .duration(150)
      .attr('y', d=> {
        return this.height - scale(d.valueRealtime / this.realtimeTotal)
      })
      .attr('height', d=> {
        return scale(d.valueRealtime / this.realtimeTotal) - 0.5*this.height;
      });

    const maxLower = d3.max( this.groups2.data().map(d => d.valueRealtime / this.realtimeTotal));
    const scaleLower = d3.scaleLinear().domain([0, maxLower]).range([0, 40]);
    this.groups2.selectAll('rect')
      .transition()
      .duration(150)
      .attr('y', d=> {
        return 60 - scaleLower(d.valueRealtime / this.realtimeTotal)
      })
      .attr('height', d=> {
        return scaleLower(d.valueRealtime / this.realtimeTotal);
      });

  }
}
