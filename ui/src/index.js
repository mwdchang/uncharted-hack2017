import './index.css';
import SearchResultComponent from './components/search-result-component';

const searchResultsContainer = document.getElementById('search-results-container');

if (!searchResultsContainer) {
    throw new Error('couldn\t find the searchResultsContainer element');
}

let listenToSocket = (socketUrl) => {
    const searchesSocket = io(socketUrl); //eslint-disable-line

    searchesSocket.on('connect', () =>{
        console.log('connect')
    });
    searchesSocket.on('broadcast', (searchResult) => {
        console.log('event', searchResult)

        const component = new SearchResultComponent(searchResult);
        searchResultsContainer.appendChild(component.element);
    });
    searchesSocket.on('disconnect', () => {
        console.log('disconnect')
    });
};

listenToSocket('http://10.64.16.97:22222/');