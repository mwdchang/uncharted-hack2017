import './index.css';
import SearchResultComponent from './components/search-result-component';
import SearchHits from './search-hits';
import DistributionGraphComponent from './components/distribution-graph-component';

const searchResultsContainer = document.getElementById('search-results-container');

if (!searchResultsContainer) {
    throw new Error('couldn\t find the searchResultsContainer element');
}


const browserCounts = new Map();
const searchHits = new SearchHits('search-hits');
const distributionGraphComponent = new DistributionGraphComponent();


let lastTwentySearchResultComponents = [];

/*
fetch('http://10.64.16.97:22222/api/distribution').then(d => d.json()).then( d => {
  console.log('!!!!!!!!', d);
  alert(JSON.stringify(d));
});
*/

let listenToSocket = (socketUrl) => {
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
        }

        //distributionGraphComponent.update()
    });
    searchesSocket.on('disconnect', () => {
        console.log('disconnected from searches socket')
    });
};

listenToSocket('http://10.64.16.97:22222/');
