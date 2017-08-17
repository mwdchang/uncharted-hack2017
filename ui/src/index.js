/* global d3 */
import './index.css';
import SearchResultComponent from './components/search-result-component';
import FilteredSearchResultsComponent from './components/filtered-search-results-component';
import SearchHits from './search-hits';
import DistributionGraphComponent from './components/distribution-graph-component';
import SearchFilter from './search-filter';
import RelatedSubjectsComponent, { transformSearchResultsToGraph } from './components/related-subjects-component';


const searchResultsContainer = document.getElementById('search-results-container');
const filteredSearchResultsContainer = document.getElementById('filtered-search-results-container');

if (!searchResultsContainer) {
    throw new Error('couldn\t find the searchResultsContainer element');
}
if (!filteredSearchResultsContainer) {
    throw new Error('couldn\t find the filteredSearchResultsContainer element');
}


const searchHits = new SearchHits('search-hits');
const distributionGraphComponent = new DistributionGraphComponent();


let lastTwentySearchResultComponents = [];

d3.select('button').on('click', ()=> {
  d3.select('.modal-overlay').style('display', 'none');
})

d3.select('.toggle-modal').on('click', ()=> {
  d3.select('.modal-overlay').style('display', 'flex');
})
/*
fetch('http://10.64.16.97:22222/api/distribution').then(d => d.json()).then( d => {
  console.log('!!!!!!!!', d);
  alert(JSON.stringify(d));
});
*/

let listOfSearchResults = [];

let listenToSocket = (socketUrl, searchFilter) => {
    const searchesSocket = io(socketUrl); //eslint-disable-line

    searchesSocket.on('connect', () => {
        console.log('connected to searches socket')
    });
    searchesSocket.on('broadcast', (data) => {
        console.log('received searchResult', data)

        // Update graph
        if (data.type === 'search') {
            let searchResult = data.data;

            searchHits.update(searchResult);

            const component = new SearchResultComponent(searchResult);
            searchResultsContainer.appendChild(component.element);

            lastTwentySearchResultComponents.push(component.element);
            lastTwentySearchResultComponents = lastTwentySearchResultComponents.slice(-20);

            const childrenToRemove = [...searchResultsContainer.children].filter(child => lastTwentySearchResultComponents.indexOf(child) === -1);
            childrenToRemove.forEach(child => {
                searchResultsContainer.removeChild(child);
            });

            searchFilter.processSearchResult(searchResult);

            listOfSearchResults.push(searchResult);
        }

        if (data.type === 'rt-distribution') {
            distributionGraphComponent.update(data.data);
        }
    });
    searchesSocket.on('disconnect', () => {
        console.log('disconnected from searches socket')
    });
};

const searchFilter =  new SearchFilter();
listenToSocket('localhost:22222/', searchFilter);
// listenToSocket('http://10.64.16.97:22222/', searchFilter);

// let relatedSubjects;
// setTimeout(() => {
//     relatedSubjects = new RelatedSubjectsComponent('floaty-graph', transformSearchResultsToGraph(listOfSearchResults));
// }, 5000);

let setupRightPane = () => {
    searchFilter.filters.forEach(filter => {
        let component = new FilteredSearchResultsComponent(filter);
        filteredSearchResultsContainer.appendChild(component.element);
    });

    // Logic for switching between the search result panes
    filteredSearchResultsContainer.classList.add('hidden');

    const switchSearchResultsButton = document.getElementById('switch-search-results');
    if (!switchSearchResultsButton) {
        throw new Error('couldn\t find the switchSearchResultsButton element');
    }

    switchSearchResultsButton.onclick = () => {
        if (searchResultsContainer.classList.contains('hidden')) {
            searchResultsContainer.classList.remove('hidden');
            filteredSearchResultsContainer.classList.add('hidden');
        } else {
            searchResultsContainer.classList.add('hidden');
            filteredSearchResultsContainer.classList.remove('hidden');
        }
    };
};
setupRightPane();
