import * as actions from '../actions/settings'
import {Map} from 'immutable'

const initial = Map({
    data: {},
    loading: false,
    loaded: false,
    searchLoaded: {
        user: false
    }
})

export function settings(state = initial, action) {
    switch (action.type) {
        case actions.FETCH_SETTINGS_START:
            return Map({
                data: state.get('data'),
                loading: true,
                loaded: false,
                searchLoaded: {
                    user: false
                }
            })

        case actions.FETCH_SETTINGS_SUCCESS:
            return Map({
                data: action.resp,
                loading: false,
                loaded: true,
                searchLoaded: {
                    user: false
                }
            })

        case actions.LOADED_SEARCH:
            return Map({
                data: state.get('data'),
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
