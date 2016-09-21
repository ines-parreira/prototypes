import {fromJS} from 'immutable'
import * as types from './constants'

export const initialState = fromJS({
    _internal: {
        loading: {
            search: false,
            displayedUser: false
        },
        mode: 'default' // can be 'default' for ticket.requester, 'search' for searchResults and 'preview' for user data
    },
    searchResults: [],
    displayedUser: {}
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.SEARCH_USERS_START:
            return state.mergeDeep({
                _internal: {
                    loading: {
                        search: true
                    },
                    mode: 'search'
                }
            })

        case types.SEARCH_USERS_SUCCESS:
            return state
                .setIn(['_internal', 'loading', 'search'], false)
                .set('searchResults', fromJS(action.resp.data.slice(0, 4))) // we only take the first 5 results

        case types.RESET_SEARCH:
            return state.mergeDeep({
                _internal: {
                    loading: {
                        search: false
                    },
                    mode: 'default'
                },
                searchResults: []
            })

        case types.FETCH_PREVIEW_USER_START:
            return state.mergeDeep({
                _internal: {
                    loading: {
                        displayedUser: true
                    },
                    mode: 'preview'
                }
            })

        case types.FETCH_PREVIEW_USER_SUCCESS:
            return state.mergeDeep({
                _internal: {
                    loading: {
                        displayedUser: false
                    }
                }
            }).set('displayedUser', fromJS(action.resp))

        case types.SET_INFOBAR_MODE:
            return state.setIn(['_internal', 'mode'], action.mode)

        default:
            return state
    }
}
