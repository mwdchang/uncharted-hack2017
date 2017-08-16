import './search-result.css';

export default class SearchResultComponent {
    constructor({
        terms,
        timestamp,
        matches,
        subjects
     }) {
        const mainElement = document.createElement('li');
        mainElement.classList.add('search-result');

        mainElement.appendChild(this._searchTerm(terms));
        mainElement.appendChild(this._timestamp(timestamp));
        mainElement.appendChild(this._matchesSummary(matches));
        mainElement.appendChild(this._details(matches, subjects));

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

    _matchesSummary(matches) {
        const matchesSummaryElement = document.createElement('div');
        matchesSummaryElement.classList.add('matches-summary');
        matchesSummaryElement.textContent = `${matches.length} results`;

        matchesSummaryElement.onclick = () => {
            this._toggleHitsDetailsExpanded();
        }

        return matchesSummaryElement;
    }

    _details(matches, subjects) {
        const detailsContainerElement = document.createElement('div');
        detailsContainerElement.classList.add('details-container', 'collapsed');

        detailsContainerElement.appendChild(this._matchesDetails(matches));
        detailsContainerElement.appendChild(this._subjectsDetails(subjects));

        this._detailsContainerElement = detailsContainerElement;

        return detailsContainerElement;
    }

    _matchesDetails(matches) {
        const matchesDetailsContainerElement = document.createElement('div');
        matchesDetailsContainerElement.classList.add('matches-container');

        matches.map(matchTitle => {
            const matchTitleElement = document.createElement('div');
            matchTitleElement.classList.add('title');
            matchTitleElement.textContent = matchTitle;

            matchesDetailsContainerElement.appendChild(matchTitleElement);

            return matchTitleElement;
        }).forEach(hitElement => matchesDetailsContainerElement.appendChild(hitElement));

        return matchesDetailsContainerElement;
    }

    _subjectsDetails(subjects) {
        const subjectsDetailsContainerElement = document.createElement('div');
        subjectsDetailsContainerElement.classList.add('subjects-container');

        subjects.map(subject => {
            const subjectElement = document.createElement('div');
            subjectElement.classList.add('subject');
            subjectElement.textContent = subject;

            subjectsDetailsContainerElement.appendChild(subjectElement);

            return subjectElement;
        }).forEach(hitElement => subjectsDetailsContainerElement.appendChild(hitElement));

        return subjectsDetailsContainerElement;
    }

    _toggleHitsDetailsExpanded() {
        this._hitsDetailsExpanded = !this._hitsDetailsExpanded;
        if (this._detailsContainerElement.classList.contains('collapsed')) {
            this._detailsContainerElement.classList.add('expanded');
            this._detailsContainerElement.classList.remove('collapsed');
        } else {
            this._detailsContainerElement.classList.remove('expanded');
            this._detailsContainerElement.classList.add('collapsed');
        }
    }
}