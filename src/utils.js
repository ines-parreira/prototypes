import instantsearch from 'instantsearch.js'
import moment from 'moment'
import 'moment-timezone'

export function loadSearch(props, indexName, searchBoxName, updateMethod, nbHits = 5) {
    function searchResults({updateMethod}) {
        return {
            render({results}) {
                updateMethod(results.hits.splice(null, nbHits), results.query)
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
            updateMethod,
            hitsPerPage: 5
        })
    )

    props.actions.settings.loadedSearch(searchBoxName)
    search.start()
}


export function formatDatetime(datetime, timezone) {
    try {
        return moment(datetime).tz(timezone || 'UTC').calendar()
    } catch (e) {
        console.error('Failed to format datetime', e, datetime, timezone)
        return datetime
    }
}
