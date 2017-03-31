import {fromJS} from 'immutable'
import * as types from './constants'
import * as utils from './utils'
import * as userTypes from './../users/constants'

export const initialState = fromJS({
    _internal: {
        loading: {
            search: false,
            displayedUser: false,
            displayedUserPictureUrl: false
        },
        mergeUsersModal: {
            display: false
        },
        mode: 'default' // can be 'default' for ticket.requester, 'search' for searchResults and 'preview' for user data
    },
    picture: {
        url: null,
        email: null
    },
    searchResults: [],
    pendingActionsCallbacks: [],
    displayedUser: {},
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.SEARCH_USERS_START: {
            return state.mergeDeep({
                _internal: {
                    loading: {
                        search: true
                    },
                    mode: 'search'
                }
            })
        }

        case types.SEARCH_USERS_SUCCESS: {
            return state
                .setIn(['_internal', 'loading', 'search'], false)
                .set('searchResults', fromJS(action.resp.data.slice(0, 8))) // we only take the first 8 results
        }

        case types.RESET_SEARCH: {
            return state.mergeDeep({
                _internal: {
                    loading: {
                        search: false
                    },
                    mode: 'default'
                }
            }).set('searchResults', fromJS([]))
        }

        case types.FETCH_PREVIEW_USER_START: {
            return state.mergeDeep({
                _internal: {
                    loading: {
                        displayedUser: true
                    },
                    mode: 'preview'
                }
            })
        }

        case types.FETCH_PREVIEW_USER_SUCCESS: {
            return state
                .setIn(['_internal', 'loading', 'displayedUser'], false)
                .set('displayedUser', fromJS(action.resp))
        }

        case types.FETCH_USER_PICTURE_START: {
            return state.setIn(['_internal', 'loading', 'displayedUserPictureUrl'], true)
        }

        case types.FETCH_USER_PICTURE_SUCCESS: {
            return state
                .setIn(['_internal', 'loading', 'displayedUserPictureUrl'], false)
                .set('picture', fromJS({
                    url: action.url,
                    email: action.email
                }))
        }

        case types.FETCH_USER_PICTURE_ERROR: {
            return state
                .set('displayedUserPictureUrl', null)
                .setIn(['_internal', 'loading', 'displayedUserPictureUrl'], false)
        }

        case types.SET_INFOBAR_MODE: {
            return state.setIn(['_internal', 'mode'], action.mode)
        }

        case types.TOGGLE_MERGE_USERS_MODAL: {
            const value = action.value !== undefined
                ? action.value
                : !state.getIn(['_internal', 'mergeUsersModal', 'display'])

            return state.setIn(['_internal', 'mergeUsersModal', 'display'], value)
        }

        case userTypes.MERGE_USERS_SUCCESS: {
            return state.mergeDeep({
                _internal: {
                    loading: {
                        mergeUsersModal: false
                    },
                    mode: 'default'
                }
            })
        }

        case types.EXECUTE_ACTION_START: {
            if (!action.callback) {
                return state
            }

            const actionId = utils.actionButtonHashForData(action.data)

            return state.updateIn(['pendingActionsCallbacks'], (list) => {
                return list.push(fromJS({
                    id: actionId,
                    callback: action.callback,
                }))
            })
        }

        case types.EXECUTE_ACTION_ERROR:
        case types.EXECUTE_ACTION_SUCCESS: {
            const actionId = utils.actionButtonHashForData(action.data)

            const actionIndex = state
                .get('pendingActionsCallbacks')
                .findIndex(pendingAction => pendingAction.get('id') === actionId)

            if (!~actionIndex) {
                return state
            }

            return state.updateIn(['pendingActionsCallbacks'], (list) => {
                const callback = list.getIn([actionIndex, 'callback'])

                if (callback) {
                    callback(action.data) // execute callback
                }

                return list.remove(actionIndex)
            })
        }

        default:
            return state
    }
}
