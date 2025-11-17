import { fromJS } from 'immutable'

import type { GorgiasAction } from '../../../types'
import { SET_ADDRESSES, SET_INITIAL_STATE, SET_LOADING } from './constants'
import type { EditShippingAddressState } from './types'

export const initialState: EditShippingAddressState = fromJS({
    loading: false,
    loadingMessage: null,
    addresses: [],
})

export default function reducer(
    state: EditShippingAddressState = initialState,
    action: GorgiasAction,
): EditShippingAddressState {
    switch (action.type) {
        case SET_LOADING:
            return state
                .set('loading', action.loading)
                .set('loadingMessage', action.message)
        case SET_ADDRESSES:
            return state.set('addresses', action.addresses)
        case SET_INITIAL_STATE:
            return initialState
        default:
            return state
    }
}
