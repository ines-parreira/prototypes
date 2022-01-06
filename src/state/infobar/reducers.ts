import {fromJS, Map, List} from 'immutable'

import {GorgiasAction} from '../types'

import * as constants from './constants'
import {InfobarState} from './types'

export const initialState: InfobarState = fromJS({
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
    state: InfobarState = initialState,
    action: GorgiasAction
): InfobarState {
    switch (action.type) {
        case constants.EXECUTE_ACTION_START: {
            return state.updateIn(
                ['pendingActionsCallbacks'],
                (list: List<any>) => {
                    return list.push(
                        fromJS({
                            id: action.id,
                            callback: action.callback,
                        })
                    )
                }
            )
        }

        case constants.EXECUTE_ACTION_ERROR:
        case constants.EXECUTE_ACTION_SUCCESS: {
            const actionIndex = (
                state.get('pendingActionsCallbacks') as List<any>
            ).findIndex(
                (pendingAction: Map<any, any>) =>
                    pendingAction.get('id') === action.id
            )

            if (!~actionIndex) {
                return state
            }

            return state.updateIn(
                ['pendingActionsCallbacks'],
                (list: List<any>) => {
                    const callback = list.getIn([actionIndex, 'callback']) as (
                        arg: unknown
                    ) => void

                    if (callback) {
                        callback(action.data) // execute callback
                    }

                    return list.remove(actionIndex)
                }
            )
        }

        default:
            return state
    }
}
