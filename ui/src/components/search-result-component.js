import './search-result.css';

export default class SearchResultComponent {
    constructor({
        terms,
        timestamp,
        hits
     }) {
        const mainElement = document.createElement('li');
        mainElement.classList.add('search-result');

        mainElement.appendChild(this._searchTerm(terms));
        mainElement.appendChild(this._timestamp(timestamp));
        mainElement.appendChild(this._hitsSummary(hits));

        this.element = mainElement;
    }

    _searchTerm(terms) {
        const searchTermElement = document.createElement('div');
        searchTermElement.classList.add('term');
        searchTermElement.textContent = terms;

        return searchTermElement;
    }

    _timestamp(timestamp) {
        const timestampElement = document.createElement('div');
        timestampElement.classList.add('timestamp');

        const date = new Date(timestamp);

        timestampElement.textContent = date;

        return timestampElement;
    }

    _hitsSummary(hits) {
        const hitsSummaryElement = document.createElement('div');
        hitsSummaryElement.classList.add('hits-summary');
        hitsSummaryElement.textContent = `${hits.length} results`;

        return hitsSummaryElement;
    }
}