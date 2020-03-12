import {fromJS} from 'immutable'

import {initialState as duplicateOrderInitialState} from '../state/infobarActions/shopify/duplicateOrder/reducers'
import {initialState as cancelOrderInitialState} from '../state/infobarActions/shopify/cancelOrder/reducers'
import type {DuplicateOrderState} from '../state/infobarActions/shopify/duplicateOrder/types'
import type {CancelOrderState} from '../state/infobarActions/shopify/cancelOrder/types'
import type {InfobarActionsState} from '../state/infobarActions/types'
import {SHOPIFY_INTEGRATION_TYPE} from '../constants/integration'

export const infobarActionsStateFixture = (
    {
        cancelOrderState = cancelOrderInitialState,
        duplicateOrderState = duplicateOrderInitialState,
    } = {}
): InfobarActionsState => ({
    [SHOPIFY_INTEGRATION_TYPE]: {
        cancelOrder: cancelOrderState,
        duplicateOrder: duplicateOrderState,
    },
})

export const duplicateOrderStateFixture = (
    {
        loading = false,
        loadingMessage = null,
        payload = null,
        draftOrder = null,
        products = new Map(),
        defaultShippingLine = null,
    } = {}
): DuplicateOrderState => fromJS({
    loading,
    loadingMessage,
    payload,
    draftOrder,
    products,
    defaultShippingLine,
})

export const cancelOrderStateFixture = (
    {
        loading = false,
        loadingMessage = null,
        orderId = null,
        payload = null,
        lineItems = null,
        refund = null,
    } = {}
): CancelOrderState => fromJS({
    loading,
    loadingMessage,
    orderId,
    payload,
    lineItems,
    refund,
})
