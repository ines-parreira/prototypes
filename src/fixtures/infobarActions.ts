import {fromJS, Map as ImmutableMap, List} from 'immutable'

import {initialState as createOrderInitialState} from '../state/infobarActions/shopify/createOrder/reducers'
import {initialState as cancelOrderInitialState} from '../state/infobarActions/shopify/cancelOrder/reducers'
import {initialState as refundOrderInitialState} from '../state/infobarActions/shopify/refundOrder/reducers'
import {CreateOrderState} from '../state/infobarActions/shopify/createOrder/types'
import {CancelOrderState} from '../state/infobarActions/shopify/cancelOrder/types'
import {RefundOrderState} from '../state/infobarActions/shopify/refundOrder/types'
import {InfobarActionsState} from '../state/infobarActions/types'
import {SHOPIFY_INTEGRATION_TYPE} from '../constants/integration'

export const infobarActionsStateFixture = ({
    cancelOrderState = cancelOrderInitialState,
    createOrderState = createOrderInitialState,
    refundOrderState = refundOrderInitialState,
}: {
    cancelOrderState?: typeof cancelOrderInitialState
    createOrderState?: typeof createOrderInitialState
    refundOrderState?: typeof refundOrderInitialState
} = {}): InfobarActionsState => ({
    [SHOPIFY_INTEGRATION_TYPE]: {
        cancelOrder: cancelOrderState,
        createOrder: createOrderState,
        refundOrder: refundOrderState,
    },
})

export const createOrderStateFixture = ({
    loading = false,
    loadingMessage = null,
    payload = null,
    calculatedDraftOrder = null,
    products = new Map(),
} = {}) =>
    fromJS({
        loading,
        loadingMessage,
        payload,
        calculatedDraftOrder,
        products,
    }) as CreateOrderState

export const cancelOrderStateFixture = ({
    loading = false,
    loadingMessage = null,
    orderId = null,
    payload = null,
    lineItems = null,
    refund = null,
} = {}) =>
    fromJS({
        loading,
        loadingMessage,
        orderId,
        payload,
        lineItems,
        refund,
    }) as CancelOrderState

export const refundOrderStateFixture = ({
    loading = false,
    loadingMessage = null,
    orderId = null,
    payload = null,
    lineItems = null,
    refund = null,
}: {
    loading?: boolean
    loadingMessage?: string | null
    orderId?: string | null
    payload?: ImmutableMap<any, any> | null
    lineItems?: List<any> | null
    refund?: ImmutableMap<any, any> | null
} = {}) =>
    fromJS({
        loading,
        loadingMessage,
        orderId,
        payload,
        lineItems,
        refund,
    }) as RefundOrderState
