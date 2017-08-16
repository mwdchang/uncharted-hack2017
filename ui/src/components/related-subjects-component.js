/* global d3  */

export function transformSearchResultsToGraph(listOfSearchResults) {
    const subjectsSet = new Set();
    const links = [];

    const linksSet = new Set();

    listOfSearchResults.forEach(searchResult => {
        searchResult.subjects.forEach(subject => {
            subjectsSet.add(subject);

            searchResult.subjects.forEach((otherSubject) => {
                if (otherSubject !== subject) {
                    let hash = (subj, otherSubj) => {
                        return `${subj},${otherSubj}`;
                    };

                    if (!linksSet.has(hash(subject, otherSubject))) {
                        links.push({
                            source: subject,
                            target: otherSubject
                        });

                        linksSet.add(hash(subject, otherSubject));
                    }

                }
            });
        });
    });

    const nodes = [...subjectsSet].map(subject => ({
        id: subject
    }));

    return {
        nodes,
        links
    };
}

export default class RelatedSubjectsComponent {
    constructor(target, graphData) {
        this._target = target;
        this._graphData = graphData;

        this._width = 400;
        this._height = 400;

        this._init();
    }

    _init() {
        this._svg = d3.select(`#${this._target}`).select('svg');

        this._simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) {
                return d.id;
            }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this._width / 2, this._height / 2));

        const color = d3.scaleOrdinal(d3.schemeCategory20);

        const graph = this._graphData;

        let tip = d3.tip().attr('class', 'd3-tip')
            .offset(function() {
                return [this.getBBox().height/2, 0]
            })
            .html(function(d, i) { return `${d.id}`; });

        const link = this._svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("stroke", function(d) { return 'black'; })
            .attr("stroke-width", function(d) { return 1; });

        const node = this._svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("fill", function (d) {
                return color(1);
            })
            .call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);;

        node.append("title")
            .text(function (d) {
                return d.id;
            });

        let ticked = function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        };

        this._simulation.nodes(graph.nodes).on("tick", ticked);
        this._simulation.force("link").links(graph.links);
    }
}