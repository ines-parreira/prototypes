import {createSelector} from 'reselect'

import {IntegrationType} from 'models/integration/types'

import {getInfobarActionsState} from '../selectors'

export const getShopifyActionsState = createSelector(
    getInfobarActionsState,
    (state) => state[IntegrationType.Shopify]
)
