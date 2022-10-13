import {createSelector} from 'reselect'

import {RootState} from 'state/types'
import {getBigCommerceActionsState} from 'state/infobarActions/bigcommerce/selectors'
import {BigCommerceActionsState} from 'state/infobarActions/bigcommerce/types'

import {CreateOrderState} from './types'

export const getCreateOrderState = createSelector<
    RootState,
    CreateOrderState,
    BigCommerceActionsState
>(getBigCommerceActionsState, (state) => state.createOrder)
