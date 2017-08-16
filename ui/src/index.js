import './index.css';
import SearchResultComponent from './components/search-result-component';
import SearchHits from './search-hits';

const searchResultsContainer = document.getElementById('search-results-container');

if (!searchResultsContainer) {
    throw new Error('couldn\t find the searchResultsContainer element');
}

const browserCounts = new Map();
const searchHits = new SearchHits('search-hits');

let listenToSocket = (socketUrl) => {
    const searchesSocket = io(socketUrl); //eslint-disable-line

    searchesSocket.on('connect', () =>{
        console.log('connected to searches socket')
    });
    searchesSocket.on('broadcast', (searchResult) => {
        console.log('received searchResult', searchResult)

        // Update graph
        searchHits.update(searchResult);

        const component = new SearchResultComponent(searchResult);
        searchResultsContainer.appendChild(component.element);

        const countForBrowser = browserCounts.get(searchResult.browser) || 0;
        browserCounts.set(searchResult.browser, countForBrowser + 1);
    });
    searchesSocket.on('disconnect', () => {
        console.log('disconnected from searches socket')
    });
};

listenToSocket('http://10.64.16.97:22222/');

// const tryThingsOutSvg = d3.select("#trying-things-out").append("svg"); //eslint-disable-line
