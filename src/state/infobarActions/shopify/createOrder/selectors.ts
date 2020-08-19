import {createSelector} from 'reselect'

import {RootState} from '../../../types'
import {getShopifyActionsState} from '../selectors'
import {ShopifyActionsState} from '../types'

import {CreateOrderState} from './types'

export const getCreateOrderState = createSelector<
    RootState,
    CreateOrderState,
    ShopifyActionsState
>(getShopifyActionsState, (state) => state.createOrder)
