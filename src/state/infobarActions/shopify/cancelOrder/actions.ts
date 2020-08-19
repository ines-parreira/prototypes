import {List, Map} from 'immutable'
import _debounce from 'lodash/debounce'
import axios, {AxiosError} from 'axios'

import {
    initCancelOrderPayload,
    initRefundOrderLineItems,
} from '../../../../business/shopify/order.js'
import {
    getRefundAmount,
    getTotalQuantities,
} from '../../../../business/shopify/refund.js'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker.js'
import {SegmentEvent} from '../../../../store/middlewares/types/segmentTracker'
import {formatPrice} from '../../../../business/shopify/number.js'
import {StoreDispatch, RootState} from '../../../types'
import GorgiasApi from '../../../../services/gorgiasApi.js'
import {notify} from '../../../notifications/actions.js'
import {NotificationStatus} from '../../../notifications/types'

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

let _gorgiasApi: Maybe<GorgiasApi> = null

const getApi = () => {
    if (!_gorgiasApi) {
        _gorgiasApi = new GorgiasApi()
    }

    return _gorgiasApi
}

const setLoading = (loading: boolean, message: Maybe<string> = null) => ({
    type: SET_LOADING,
    loading,
    message,
})

const setOrderId = (orderId: number) => ({
    type: SET_ORDER_ID,
    orderId,
})

export const setPayload = (payload: Map<any, any>) => ({
    type: SET_PAYLOAD,
    payload,
})

const setLineItems = (lineItems: List<any>) => ({
    type: SET_LINE_ITEMS,
    lineItems,
})

const setRefund = (refund: Map<any, any>) => ({
    type: SET_REFUND,
    refund,
})

const setRefundAmount = (amount: number) => ({
    type: SET_REFUND_AMOUNT,
    amount,
})

const setRestock = (restock: boolean) => ({
    type: SET_RESTOCK,
    restock,
})

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

export const onInit = (integrationId: number, order: Map<any, any>) => async (
    dispatch: StoreDispatch
) => {
    try {
        let payload = initCancelOrderPayload(order) as Map<any, any>
        const lineItems = initRefundOrderLineItems(order) as List<any>
        const api = getApi()
        const orderId = order.get('id') as number
        api.cancelPendingRequests(true)

        segmentTracker.logEvent(SegmentEvent.ShopifyCancelOrderOpen, {
            orderId,
        })

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
        ]) as number
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
    lineItems: List<any>
) => async (dispatch: StoreDispatch, getState: () => RootState) => {
    const state = getState()
    let newPayload = getCancelOrderState(state).get('payload') as Map<any, any>

    // Ignore already refunded line items
    newPayload = newPayload.setIn(
        ['refund', 'refund_line_items'],
        lineItems
            .map((lineItem: Map<any, any>) => {
                const refundLineItem = (newPayload.getIn([
                    'refund',
                    'refund_line_items',
                ]) as List<any>).find(
                    (refundLineItem: Map<any, any>) =>
                        refundLineItem.get('line_item_id') ===
                        lineItem.get('id')
                ) as Maybe<Map<any, any>>

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
    payload: Map<any, any>
) => async (dispatch: StoreDispatch, getState: () => RootState) => {
    dispatch(setPayload(payload))
    dispatch(setLoading(true, 'Calculating refund...'))
    return calculateRefund(integrationId, dispatch, getState)
}

export const calculateRefund = _debounce(
    async (
        integrationId: number,
        dispatch: StoreDispatch,
        getState: () => RootState
    ) => {
        try {
            dispatch(setLoading(true, 'Calculating refund...'))

            const api = getApi()
            api.cancelPendingRequests(true)

            const state = getState()
            const orderId = getCancelOrderState(state).get('orderId') as number
            const cancelOrderPayload = getCancelOrderState(state).get(
                'payload'
            ) as Map<any, any>
            const refundPayload = (cancelOrderPayload.get('refund') as Map<
                any,
                any
            >).delete('transactions')
            const currencyCode = refundPayload.get('currency') as string
            const suggestedRefund = await api.calculateRefund(
                integrationId,
                orderId,
                refundPayload
            )
            const amount = getRefundAmount(suggestedRefund)

            const promises = [
                dispatch(setRefund(suggestedRefund)),
                //$TsFixMe removing safe cast on formatPrice being migrated (flow type is incorrect)
                dispatch(
                    setRefundAmount(
                        (formatPrice(amount, currencyCode) as unknown) as number
                    )
                ),
                dispatch(setLoading(false)),
            ]

            // Check or uncheck the "Restock" checkbox
            const totalQuantities = getTotalQuantities(
                refundPayload,
                suggestedRefund
            )
            const restock = totalQuantities > 0

            if (restock !== refundPayload.get('restock')) {
                promises.push(dispatch(setRestock(restock)) as any)
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

export const onApiError = (
    error: AxiosError<{error: {msg: string}}>,
    defaultMessage: string
) => (dispatch: StoreDispatch) => {
    const message = error?.response?.data?.error?.msg

    dispatch(setLoading(false))
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message: message || defaultMessage,
            allowHTML: true,
        })
    )
}

export const onCancel = (via: string) => () => {
    getApi().cancelPendingRequests()
    calculateRefund.cancel()
    _gorgiasApi = null

    segmentTracker.logEvent(SegmentEvent.ShopifyCancelOrderCancel, {
        via,
    })
}

export const onReset = () => (dispatch: StoreDispatch) => resetState(dispatch)

export const resetState = _debounce(
    (dispatch: StoreDispatch) => dispatch(setInitialState()),
    250
)
