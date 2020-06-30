// @flow
import {fromJS} from 'immutable'

// type
import type {Map} from 'immutable'

import type {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS({
    settings: [],
    _internal: {
        loading: {},
    },
})

export default function reducer(
    state: Map<*, *> = initialState,
    action: actionType
): Map<*, *> {
    switch (action.type) {
        case constants.UPDATE_ACCOUNT_START:
            return state.setIn(['_internal', 'loading', 'updateAccount'], true)
        case constants.UPDATE_ACCOUNT_ERROR:
            return state.setIn(['_internal', 'loading', 'updateAccount'], false)
        case constants.UPDATE_ACCOUNT_SUCCESS: {
            const account = fromJS(action.resp)
            return (
                state
                    .setIn(['_internal', 'loading', 'updateAccount'], false)
                    .merge(account)
                    // do not merge the current subscription
                    // in case it has been canceled and it's empty
                    .set(
                        'current_subscription',
                        account.get('current_subscription')
                    )
            )
        }

        case constants.UPDATE_ACCOUNT_OWNER_SUCCESS:
            return state.setIn(['user_id'], action.userId)

        case constants.UPDATE_SUBSCRIPTION_SUCCESS:
            return state.update('current_subscription', (subscription) => {
                if (subscription) {
                    return subscription.merge(fromJS(action.subscription))
                }
                return fromJS(action.subscription)
            })

        case constants.SET_CURRENT_SUBSCRIPTION:
            return state.set('current_subscription', action.subscription)

        case constants.UPDATE_ACCOUNT_SETTING: {
            const new_setting = action.setting

            if (!action.isUpdate) {
                if (
                    state
                        .get('settings')
                        .findIndex(
                            (setting) =>
                                setting.get('type') === new_setting.type
                        ) !== -1
                ) {
                    return state.mergeDeep({
                        settings: [new_setting],
                    })
                }

                return state.update('settings', (settings) =>
                    settings.push(fromJS(new_setting))
                )
            }

            return state.update('settings', (settings) =>
                settings.map((setting) => {
                    if (setting.get('id') === new_setting.id) {
                        return fromJS(new_setting)
                    }
                    return setting
                })
            )
        }
        default:
            return state
    }
}
