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


const searchesSocket = io('http://10.64.16.97:22222/'); //eslint-disable-line

searchesSocket.on('connect', () =>{
    console.log('connect')
});
searchesSocket.on('broadcast', (data) => {
    console.log('event', data)
});
searchesSocket.on('disconnect', () => {
    console.log('disconnect')
});