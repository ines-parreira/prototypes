import {fromJS} from 'immutable'
import * as types from './constants'
import * as utils from './utils'

export const initialState = fromJS({
    _internal: {
        loading: {
            displayedUserPictureUrl: false,
        },
    },
    picture: {
        url: null,
        email: null,
    },
    pendingActionsCallbacks: [],
})

export default (state = initialState, action) => {
    switch (action.type) {
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
