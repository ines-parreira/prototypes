import { logEvent, SegmentEvent } from '@repo/logging'
import { isCancel } from 'axios'
import type { Map } from 'immutable'
import { List } from 'immutable'
import _debounce from 'lodash/debounce'

import {
    initRefundOrderLineItems,
    initRefundOrderPayload,
} from 'business/shopify/order'
import { getTotalQuantities } from 'business/shopify/refund'
import GorgiasApi from 'services/gorgiasApi'
import type { RootState, StoreDispatch } from 'state/types'
import { onApiError } from 'state/utils'

import {
    SET_INITIAL_STATE,
    SET_LINE_ITEMS,
    SET_LOADING,
    SET_ORDER_ID,
    SET_PAYLOAD,
    SET_REFUND,
    SET_RESTOCK,
    SET_TRANSACTIONS,
} from './constants'
import { getRefundOrderState } from './selectors'

//$TsFixMe remove once gorgiasApi is migrated
type TypeSafeGorgiasApi = {
    cancelPendingRequests: (v?: boolean) => void
    calculateRefund: (
        integrationId: number,
        orderId: number,
        payload: Map<any, any>,
    ) => Promise<Map<any, any>>
}

let _gorgiasApi: Maybe<TypeSafeGorgiasApi> = null

const getApi = (): TypeSafeGorgiasApi => {
    if (!_gorgiasApi) {
        _gorgiasApi = new GorgiasApi() as unknown as TypeSafeGorgiasApi
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

const setTransactions = (transactions: Map<any, any>) => ({
    type: SET_TRANSACTIONS,
    transactions,
})

const setRestock = (restock: boolean) => ({
    type: SET_RESTOCK,
    restock,
})

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

export const onInit =
    (integrationId: number, order: Map<any, any>) =>
    async (dispatch: StoreDispatch) => {
        let payload = initRefundOrderPayload(order)
        const lineItems = initRefundOrderLineItems(order)
        const orderId = order.get('id') as number

        logEvent(SegmentEvent.ShopifyRefundOrderOpen, {
            orderId,
        })

        dispatch(setLoading(true, 'Calculating refund...'))
        payload = payload.setIn(['shipping', 'amount'], '0.00')

        return Promise.all([
            dispatch(setOrderId(orderId)),
            dispatch(onPayloadChange(integrationId, payload)),
            dispatch(setLineItems(lineItems)),
        ])
    }

export const onLineItemChange =
    (integrationId: number, lineItem: Map<string, any>, index: number) =>
    async (dispatch: StoreDispatch, getState: () => RootState) => {
        const cancelOrderState = getRefundOrderState(getState())
        let newPayload = cancelOrderState.get('payload') as Map<any, any>
        let newLineItems = (cancelOrderState.get('lineItems') ||
            List([])) as List<any>

        newLineItems = newLineItems.set(index, lineItem)

        newPayload = newPayload.set(
            'refund_line_items',
            newLineItems
                .map((lineItem: Map<any, any>) => {
                    const refundLineItem = (
                        newPayload.get('refund_line_items') as List<any>
                    ).find(
                        (refundLineItem: Map<any, any>) =>
                            refundLineItem.get('line_item_id') ===
                            lineItem.get('id'),
                    ) as Maybe<Map<any, any>>

                    return refundLineItem
                        ? refundLineItem.set(
                              'quantity',
                              lineItem.get('quantity'),
                          )
                        : undefined
                })
                .filter((lineItem) => !!lineItem),
        )

        dispatch(setLineItems(newLineItems))
        return dispatch(onPayloadChange(integrationId, newPayload))
    }

export const onPayloadChange =
    (integrationId: number, payload: Map<any, any>) =>
    async (dispatch: StoreDispatch, getState: () => RootState) => {
        dispatch(setPayload(payload))
        dispatch(setLoading(true, 'Calculating refund...'))
        return calculateRefund(integrationId, dispatch, getState)
    }

export const calculateRefund = _debounce(
    async (
        integrationId: number,
        dispatch: StoreDispatch,
        getState: () => RootState,
    ) => {
        try {
            dispatch(setLoading(true, 'Calculating refund...'))

            const api = getApi()
            api.cancelPendingRequests(true)

            const state = getState()
            const orderId = getRefundOrderState(state).get('orderId') as number
            const payload = (
                getRefundOrderState(state).get('payload') as Map<any, any>
            ).delete('transactions')
            const suggestedRefund = await api.calculateRefund(
                integrationId,
                orderId,
                payload,
            )

            const promises = [
                dispatch(setRefund(suggestedRefund)),
                //$TsFixMe remove casting once formatPrice is migrated
                dispatch(setTransactions(suggestedRefund.get('transactions'))),
                dispatch(setLoading(false)),
            ]

            const totalQuantities = getTotalQuantities(payload, suggestedRefund)
            if (!totalQuantities && payload.get('restock')) {
                promises.push(dispatch(setRestock(false) as any))
            }

            return Promise.all(promises)
        } catch (error) {
            if (isCancel(error)) {
                return
            }

            console.error(error)
            return dispatch(
                onApiError(
                    error,
                    'Error while calculating refund',
                    setLoading(false),
                ),
            )
        }
    },
    500,
)

export const onCancel = (via: string) => () => {
    getApi().cancelPendingRequests()
    calculateRefund.cancel()
    _gorgiasApi = null

    logEvent(SegmentEvent.ShopifyRefundOrderCancel, {
        via,
    })
}

export const onReset = () => (dispatch: StoreDispatch) => resetState(dispatch)

export const resetState = _debounce(
    (dispatch: StoreDispatch) => dispatch(setInitialState()),
    250,
)
