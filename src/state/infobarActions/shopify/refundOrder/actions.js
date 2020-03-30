// @flow

import {type List, type Record} from 'immutable'
import _debounce from 'lodash/debounce'

import {initRefundOrderLineItems, initRefundOrderPayload} from '../../../../business/shopify/order'
import {getRefundAmount, getTotalQuantities} from '../../../../business/shopify/refund'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'
import * as Shopify from '../../../../constants/integrations/shopify'
import {formatPrice} from '../../../../business/shopify/number'
import type {dispatchType, getStateType} from '../../../types'
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
} from './constants'
import {getRefundOrderState} from './selectors'

let _gorgiasApi = null

const api = (): GorgiasApi => {
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

export const setPayload = (payload: Record<$Shape<Shopify.RefundOrderPayload>>) => ({
    type: SET_PAYLOAD,
    payload,
})

const setLineItems = (lineItems: List<$Shape<Shopify.LineItem>>) => ({
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

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

export const onInit = (integrationId: number, order: Record<Shopify.Order>) => (dispatch: dispatchType) => {
    const payload = initRefundOrderPayload(order)
    const lineItems = initRefundOrderLineItems(order)

    segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_REFUND_ORDER_OPEN, {
        orderId: order.get('id'),
    })

    return Promise.all([
        dispatch(setOrderId(order.get('id'))),
        dispatch(onPayloadChange(integrationId, payload)),
        dispatch(setLineItems(lineItems)),
    ])
}

export const onLineItemsChange = (integrationId: number, lineItems: List<$Shape<Shopify.LineItem>>) =>
    async (dispatch: dispatchType, getState: getStateType) => {
        const state = getState()
        let newPayload = getRefundOrderState(state).get('payload')

        newPayload = newPayload.set(
            'refund_line_items',
            lineItems
                .map((lineItem) => {
                    const refundLineItem = newPayload.get('refund_line_items').find(
                        (refundLineItem) => refundLineItem.get('line_item_id') === lineItem.get('id')
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

export const onPayloadChange = (integrationId: number, payload: Record<$Shape<Shopify.RefundOrderPayload>>) =>
    async (dispatch: dispatchType, getState: getStateType) => {
        const totalQuantities = getTotalQuantities(payload)
        let newPayload = payload

        if (totalQuantities === 0) {
            newPayload = newPayload.set('restock', false)
        }

        dispatch(setPayload(newPayload))
        dispatch(setLoading(true, 'Calculating refund...'))
        return calculateRefund(integrationId, dispatch, getState)
    }

export const calculateRefund = _debounce(
    async (integrationId: number, dispatch: dispatchType, getState: getStateType) => {
        try {
            dispatch(setLoading(true, 'Calculating refund...'))

            const state = getState()
            const orderId = getRefundOrderState(state).get('orderId')
            const payload = getRefundOrderState(state).get('payload').delete('transactions')
            const currencyCode = payload.get('currency')
            const suggestedRefund = await api().calculateRefund(integrationId, orderId, payload)
            const amount = formatPrice(getRefundAmount(suggestedRefund), currencyCode)

            return Promise.all([
                dispatch(setRefund(suggestedRefund)),
                dispatch(setRefundAmount(amount)),
                dispatch(setLoading(false)),
            ])
        } catch (error) {
            console.error(error)
            return dispatch(onApiError(error, 'Error while calculating refund'))
        }
    },
    500
)

export const onApiError = (error: Object, defaultMessage: string) => (dispatch: dispatchType) => {
    const message = error.response && error.response.data && error.response.data.error
        ? error.response.data.error.msg
        : null

    dispatch(setLoading(false))
    dispatch(notify({
        status: 'error',
        message: message || defaultMessage,
        allowHTML: true,
    }))
}

export const onCancel = (via: string) => () => {
    _gorgiasApi = null
    calculateRefund.cancel()

    segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_REFUND_ORDER_CANCEL, {
        via,
    })
}

export const onReset = () => (dispatch: dispatchType) => resetState(dispatch)

export const resetState = _debounce((dispatch: dispatchType) => dispatch(setInitialState()), 250)
