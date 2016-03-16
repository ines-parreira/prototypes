import * as actions from '../actions/settings'
import { Map } from 'immutable'
import algoliasearch from 'algoliasearch'

const initial = Map({
    data: Map(),
    loading: false,
    loaded: false,
    indices: Map(),
    searchLoaded: Map({
        user: false
    })
})


function getAlgoliaIndices(resp) {
    const { algolia_app_name, algolia_api_key, indices_names } = resp
    const client = algoliasearch(algolia_app_name, algolia_api_key)
    const ind = client.initIndex(indices_names.ticket)

    return Map({
        ticket: client.initIndex(indices_names.ticket),
        user: client.initIndex(indices_names.user),
    })
}

export function settings(state = initial, action) {
    switch (action.type) {
        case actions.FETCH_SETTINGS_START:
            return state.set('loading', true)

        case actions.FETCH_SETTINGS_SUCCESS:
            return state.merge({
                data: action.resp,
                loading: false,
                loaded: true,
                indices: getAlgoliaIndices(action.resp),
                searchLoaded: {
                    user: false
                }
            })

        case actions.LOADED_SEARCH:
            return state.merge({
                loading: false,
                loaded: true,
                searchLoaded: {
                    user: true
                }
            })

        default:
            return state
    }
}
