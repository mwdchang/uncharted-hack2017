export default class FilteredSearchResultComponent {
    constructor(searchFilterFilter) {
        this._searchFilterFilter = searchFilterFilter;

        const mainElement = document.createElement('div');

        const titleElement = document.createElement('span');
        titleElement.textContent = searchFilterFilter.name;
        mainElement.appendChild(titleElement);

        mainElement.appendChild(this._makeList());

        this.element = mainElement;
    }

    _makeList() {
        const listElement = document.createElement('ul');
        this._listElement = listElement;

        this._updateListElements();

        this._searchFilterFilter.notifyOnChange(() => {
            this._updateListElements();
        });


        return listElement;
    }

    _updateListElements() {
        this._listElement.childNodes.forEach(node => this._listElement.removeChild(node));

        this._createElementsForResults().forEach(element => this._listElement.appendChild(element));
    }

    _createElementsForResults() {
        return this._searchFilterFilter.searches.map(searchResult => {
            const resultElement = document.createElement('li');
            resultElement.textContent = searchResult.terms;

            return resultElement;
        });
    }
}