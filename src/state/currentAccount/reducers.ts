import {fromJS, Map, List} from 'immutable'

import {GorgiasAction} from '../types'

import * as constants from './constants.js'
import {CurrentAccountState} from './types'

export const initialState: CurrentAccountState = fromJS({
    settings: [],
    _internal: {
        loading: {},
    },
})

export default function reducer(
    state: CurrentAccountState = initialState,
    action: GorgiasAction
): CurrentAccountState {
    switch (action.type) {
        case constants.UPDATE_ACCOUNT_START:
            return state.setIn(['_internal', 'loading', 'updateAccount'], true)
        case constants.UPDATE_ACCOUNT_ERROR:
            return state.setIn(['_internal', 'loading', 'updateAccount'], false)
        case constants.UPDATE_ACCOUNT_SUCCESS: {
            const account: Map<any, any> = fromJS(action.resp)
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
            return state.update(
                'current_subscription',
                (subscription: Map<any, any>) => {
                    if (subscription) {
                        return subscription.merge(fromJS(action.subscription))
                    }
                    return fromJS(action.subscription) as Map<any, any>
                }
            )

        case constants.SET_CURRENT_SUBSCRIPTION:
            return state.set('current_subscription', action.subscription)

        case constants.UPDATE_ACCOUNT_SETTING: {
            if (!action.setting) {
                return state
            }
            const new_setting = action.setting

            if (!action.isUpdate) {
                if (
                    (state.get('settings') as List<any>).findIndex(
                        (setting: Map<any, any>) =>
                            setting.get('type') === new_setting.type
                    ) !== -1
                ) {
                    return state.mergeDeep({
                        settings: [new_setting],
                    })
                }

                return state.update('settings', (settings: List<any>) =>
                    settings.push(fromJS(new_setting) as Map<any, any>)
                )
            }

            return state.update('settings', (settings: List<any>) =>
                settings.map((setting: Map<any, any>) => {
                    if (setting.get('id') === new_setting.id) {
                        return fromJS(new_setting) as Map<any, any>
                    }
                    return setting
                })
            )
        }
        default:
            return state
    }
}
