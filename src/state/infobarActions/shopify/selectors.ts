import {createSelector} from 'reselect'

import {IntegrationType} from '../../../models/integration/types'
import {RootState} from '../../types'
import {getInfobarActionsState} from '../selectors'
import {InfobarActionsState} from '../types'

import {ShopifyActionsState} from './types'

export const getShopifyActionsState = createSelector<
    RootState,
    ShopifyActionsState,
    InfobarActionsState
>(getInfobarActionsState, (state) => state[IntegrationType.Shopify])
