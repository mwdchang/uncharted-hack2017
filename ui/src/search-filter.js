class Filter {
    constructor(name, matchesFilterFn) {
        this.name = name;
        this.matchesFilterFn = matchesFilterFn;
        this.searches = [];

        this._listeners = [];
    }

    matchesFilter(searchResult) {
        return this.matchesFilterFn(searchResult);
    }

    addSearch(search) {
        this.searches.push(search);
        this.triggerOnChange();
    }

    notifyOnChange(listener) {
        this._listeners.push(listener);
    }

    triggerOnChange() {
        this._listeners.forEach(listener => listener());
    }
}

export default class {
    constructor() {
        this.filters = [
            new Filter('No matches', (searchResult) => {
                return searchResult.matches.length === 0;
            }),
            new Filter('Searching for "windows"', (searchResult) => {
                return searchResult.terms.toLowerCase().trim().includes('windows');
            }),
            new Filter('Searching for "movies"', (searchResult) => {
                return searchResult.terms.toLowerCase().trim().includes('movies');
            }),
            new Filter('Searching for "java"', (searchResult) => {
                return searchResult.terms.toLowerCase().trim().includes('java');
            })
        ];
    }

    processSearchResult(searchResult) {
        this.filters.forEach(filter => {
            if (filter.matchesFilter(searchResult)) {
                filter.addSearch(searchResult);
            }
        })
    }
}