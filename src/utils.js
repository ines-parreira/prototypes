import instantsearch from 'instantsearch.js'

export function loadSearch(props, indexName, searchBoxName) {
    function searchResults({ updateMethod }) {
        return {
            render({ results }) {
                updateMethod(results.hits.splice(null, 5))
            }
        }
    }

    const search = instantsearch({
        appId: props.settings.get('data').get('algolia_app_name'),
        apiKey: props.settings.get('data').get('algolia_api_key'),
        indexName: props.settings.get('data').get('indices_names').get(indexName)
    })

    search.addWidget(
        instantsearch.widgets.searchBox({
            container: document.querySelector(`#search-${searchBoxName}`)
        })
    )

    search.addWidget(
        searchResults({
            updateMethod: props.actions.ticket.updatePotentialRequesters,
            hitsPerPage: 5
        })
    )

    props.actions.settings.loadedSearch(searchBoxName)
    search.start()
}