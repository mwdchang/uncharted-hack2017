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
        mainElement.appendChild(this._hitsDetails(hits));

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

        timestampElement.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        return timestampElement;
    }

    _hitsSummary(hits) {
        const hitsSummaryElement = document.createElement('div');
        hitsSummaryElement.classList.add('hits-summary');
        hitsSummaryElement.textContent = `${hits.length} results`;

        hitsSummaryElement.onclick = () => {
            this._toggleHitsDetailsExpanded();
        }

        return hitsSummaryElement;
    }

    _hitsDetails(hits) {
        const hitsDetailsContainerElement = document.createElement('div');
        hitsDetailsContainerElement.classList.add('hits-details-container', 'collapsed');

        this._hitsDetailsContainerElement = hitsDetailsContainerElement;

        hits.map(hit => {
            const hitsDetailsElement = document.createElement('div');
            hitsDetailsElement.classList.add('hit');

            const hitsTitle = document.createElement('div');
            hitsTitle.classList.add('title');
            hitsTitle.textContent = hit.title;

            hitsDetailsElement.appendChild(hitsTitle);

            const subjectsContainer = document.createElement('div');
            subjectsContainer.classList.add('subjects-container');

            hitsDetailsElement.appendChild(subjectsContainer);

            hit.subject.map(subject => {
                const subjectSpan = document.createElement('span');
                subjectSpan.classList.add('subject');
                subjectSpan.textContent = subject;

                return subjectSpan;
            }).forEach(subjectSpan => subjectsContainer.appendChild(subjectSpan));

            return hitsDetailsElement;
        }).forEach(hitElement => hitsDetailsContainerElement.appendChild(hitElement));

        return hitsDetailsContainerElement;
    }

    _toggleHitsDetailsExpanded() {
        this._hitsDetailsExpanded = !this._hitsDetailsExpanded;
        if (this._hitsDetailsContainerElement.classList.contains('collapsed')) {
            this._hitsDetailsContainerElement.classList.add('expanded');
            this._hitsDetailsContainerElement.classList.remove('collapsed');
        } else {
            this._hitsDetailsContainerElement.classList.remove('expanded');
            this._hitsDetailsContainerElement.classList.add('collapsed');
        }
    }
}