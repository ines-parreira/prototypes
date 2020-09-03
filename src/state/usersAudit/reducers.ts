import {fromJS} from 'immutable'

import {GorgiasAction} from '../types'

import * as constants from './constants'
import {UsersAuditState} from './types'

export const initialState: UsersAuditState = fromJS({
    events: [],
    meta: {},
})

export default function reducer(
    state: UsersAuditState = initialState,
    action: GorgiasAction
): UsersAuditState {
    switch (action.type) {
        case constants.FETCH_USERS_AUDIT_SUCCESS: {
            return fromJS({
                events: action.events,
                meta: action.meta,
            }) as UsersAuditState
        }
        default:
            return state
    }
}
