// @flow
import {fromJS} from 'immutable'
import type {Map} from 'immutable'

import type {actionType} from '../types'

import * as constants from './constants'
import * as utils from './utils'

export const initialState = fromJS({
    _internal: {
        loading: {},
    },
    picture: {
        url: null,
        email: null,
    },
    pendingActionsCallbacks: [],
})

export default function reducer(
    state: Map<*, *> = initialState,
    action: actionType
): Map<*, *> {
    switch (action.type) {
        case constants.EXECUTE_ACTION_START: {
            if (!action.callback) {
                return state
            }

            const actionId = utils.actionButtonHashForData(action.data)

            return state.updateIn(['pendingActionsCallbacks'], (list) => {
                return list.push(
                    fromJS({
                        id: actionId,
                        callback: action.callback,
                    })
                )
            })
        }

        case constants.EXECUTE_ACTION_ERROR:
        case constants.EXECUTE_ACTION_SUCCESS: {
            const actionId = utils.actionButtonHashForData(action.data)

            const actionIndex = state
                .get('pendingActionsCallbacks')
                .findIndex(
                    (pendingAction) => pendingAction.get('id') === actionId
                )

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
