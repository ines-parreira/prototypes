// @flow

import {type List, type Record} from 'immutable'
import _debounce from 'lodash/debounce'
import axios from 'axios'

import {
    initCancelOrderPayload,
    initRefundOrderLineItems,
} from '../../../../business/shopify/order'
import {
    getRefundAmount,
    getTotalQuantities,
} from '../../../../business/shopify/refund'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'
import type {
    CancelOrderPayload,
    LineItem,
    Order,
} from '../../../../constants/integrations/types/shopify'
import {formatPrice} from '../../../../business/shopify/number'
import type {Dispatch, getStateType} from '../../../types'
import GorgiasApi from '../../../../services/gorgiasApi'
import {notify} from '../../../notifications/actions'

import {
    SET_INITIAL_STATE,
    SET_LINE_ITEMS,
    SET_LOADING,
    SET_ORDER_ID,
    SET_PAYLOAD,
    SET_REFUND,
    SET_REFUND_AMOUNT,
    SET_RESTOCK,
} from './constants'
import {getCancelOrderState} from './selectors'

let _gorgiasApi = null

const getApi = (): GorgiasApi => {
    if (!_gorgiasApi) {
        _gorgiasApi = new GorgiasApi()
    }

    return _gorgiasApi
}

const setLoading = (loading: boolean, message: ?string = null) => ({
    type: SET_LOADING,
    loading,
    message,
})

const setOrderId = (orderId) => ({
    type: SET_ORDER_ID,
    orderId,
})

export const setPayload = (payload: Record<$Shape<CancelOrderPayload>>) => ({
    type: SET_PAYLOAD,
    payload,
})

const setLineItems = (lineItems: List<$Shape<LineItem>>) => ({
    type: SET_LINE_ITEMS,
    lineItems,
})

const setRefund = (refund) => ({
    type: SET_REFUND,
    refund,
})

const setRefundAmount = (amount) => ({
    type: SET_REFUND_AMOUNT,
    amount,
})

const setRestock = (restock) => ({
    type: SET_RESTOCK,
    restock,
})

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

export const onInit = (integrationId: number, order: Record<Order>) => async (
    dispatch: Dispatch
) => {
    try {
        let payload = initCancelOrderPayload(order)
        const lineItems = initRefundOrderLineItems(order)
        const api = getApi()
        const orderId = order.get('id')
        api.cancelPendingRequests(true)

        segmentTracker.logEvent(
            segmentTracker.EVENTS.SHOPIFY_CANCEL_ORDER_OPEN,
            {
                orderId,
            }
        )

        // Fetch maximum refundable amount, and use it as default value
        dispatch(setLoading(true, 'Calculating refund...'))

        const suggestedRefund = await api.calculateRefund(
            integrationId,
            orderId,
            payload
        )
        const shippingMaximumRefundable = suggestedRefund.getIn([
            'shipping',
            'maximum_refundable',
        ])
        payload = payload.setIn(
            ['refund', 'shipping', 'amount'],
            shippingMaximumRefundable
        )

        return Promise.all([
            dispatch(setOrderId(orderId)),
            dispatch(onPayloadChange(integrationId, payload)),
            dispatch(setLineItems(lineItems)),
        ])
    } catch (error) {
        if (axios.isCancel(error)) {
            return
        }

        console.error(error)
        return dispatch(onApiError(error, 'Error while calculating refund'))
    }
}

export const onLineItemsChange = (
    integrationId: number,
    lineItems: List<$Shape<LineItem>>
) => async (dispatch: Dispatch, getState: getStateType) => {
    const state = getState()
    let newPayload = getCancelOrderState(state).get('payload')

    // Ignore already refunded line items
    newPayload = newPayload.setIn(
        ['refund', 'refund_line_items'],
        lineItems
            .map((lineItem) => {
                const refundLineItem = newPayload
                    .getIn(['refund', 'refund_line_items'])
                    .find(
                        (refundLineItem) =>
                            refundLineItem.get('line_item_id') ===
                            lineItem.get('id')
                    )

                return refundLineItem
                    ? refundLineItem.set('quantity', lineItem.get('quantity'))
                    : refundLineItem
            })
            .filter((lineItem) => !!lineItem)
    )

    dispatch(setLineItems(lineItems))
    return dispatch(onPayloadChange(integrationId, newPayload))
}

export const onPayloadChange = (
    integrationId: number,
    payload: Record<$Shape<CancelOrderPayload>>
) => async (dispatch: Dispatch, getState: getStateType) => {
    dispatch(setPayload(payload))
    dispatch(setLoading(true, 'Calculating refund...'))
    return calculateRefund(integrationId, dispatch, getState)
}

export const calculateRefund = _debounce(
    async (
        integrationId: number,
        dispatch: Dispatch,
        getState: getStateType
    ) => {
        try {
            dispatch(setLoading(true, 'Calculating refund...'))

            const api = getApi()
            api.cancelPendingRequests(true)

            const state = getState()
            const orderId = getCancelOrderState(state).get('orderId')
            const cancelOrderPayload = getCancelOrderState(state).get('payload')
            const refundPayload = cancelOrderPayload
                .get('refund')
                .delete('transactions')
            const currencyCode = refundPayload.get('currency')
            const suggestedRefund = await api.calculateRefund(
                integrationId,
                orderId,
                refundPayload
            )
            const amount = getRefundAmount(suggestedRefund)

            const promises = [
                dispatch(setRefund(suggestedRefund)),
                dispatch(setRefundAmount(formatPrice(amount, currencyCode))),
                dispatch(setLoading(false)),
            ]

            // Check or uncheck the "Restock" checkbox
            const totalQuantities = getTotalQuantities(
                refundPayload,
                suggestedRefund
            )
            const restock = totalQuantities > 0

            if (restock !== refundPayload.get('restock')) {
                promises.push(dispatch(setRestock(restock)))
            }

            return Promise.all(promises)
        } catch (error) {
            if (axios.isCancel(error)) {
                return
            }

            console.error(error)
            return dispatch(onApiError(error, 'Error while calculating refund'))
        }
    },
    500
)

export const onApiError = (error: Object, defaultMessage: string) => (
    dispatch: Dispatch
) => {
    const message =
        error.response && error.response.data && error.response.data.error
            ? error.response.data.error.msg
            : null

    dispatch(setLoading(false))
    dispatch(
        notify({
            status: 'error',
            message: message || defaultMessage,
            allowHTML: true,
        })
    )
}

export const onCancel = (via: string) => () => {
    getApi().cancelPendingRequests()
    calculateRefund.cancel()
    _gorgiasApi = null

    segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_CANCEL_ORDER_CANCEL, {
        via,
    })
}

export const onReset = () => (dispatch: Dispatch) => resetState(dispatch)

export const resetState = _debounce(
    (dispatch: Dispatch) => dispatch(setInitialState()),
    250
)
