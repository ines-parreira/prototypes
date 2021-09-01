import {createSelector} from 'reselect'

import {RootState} from '../../../types'
import {getShopifyActionsState} from '../selectors'
import {ShopifyActionsState} from '../types'

import {EditShippingAddressState} from './types'

export const getShippingAddressState = createSelector<
    RootState,
    EditShippingAddressState,
    ShopifyActionsState
>(getShopifyActionsState, (state) => state.editShippingAddress)
