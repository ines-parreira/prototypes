import { fromJS } from 'immutable'

import type { GorgiasAction } from '../types'
import * as constants from './constants'
import type { BillingImmutableState } from './types'

export const initialState: BillingImmutableState = fromJS({})

export default function reducer(
    state: BillingImmutableState = initialState,
    action: GorgiasAction,
): BillingImmutableState {
    switch (action.type) {
        case constants.FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS:
            return state.set('currentProductsUsage', fromJS(action.resp))
        default:
            return state
    }
}
