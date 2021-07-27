import {createSelector} from 'reselect'

import {RootState} from '../../../types'
import {getShopifyActionsState} from '../selectors'
import {ShopifyActionsState} from '../types'

import {EditOrderState} from './types'

export const getEditOrderState = createSelector<
    RootState,
    EditOrderState,
    ShopifyActionsState
>(getShopifyActionsState, (state) => state.editOrder)
