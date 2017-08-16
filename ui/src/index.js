import './index.css';
import SearchResultComponent from './components/search-result-component';

import websocketData from './mock-data/websocket-data';

const searchResultsContainer = document.getElementById('search-results-container');

if (!searchResultsContainer) {
    throw new Error('couldn\t find the searchResultsContainer element');
}

websocketData
    .map(searchResult => new SearchResultComponent(searchResult))
    .forEach(component => searchResultsContainer.appendChild(component.element));