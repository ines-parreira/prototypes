import {Map} from 'immutable'

import client from '../../models/api/resources'
import {ApiListResponsePagination} from '../../models/api/types'
import {StoreDispatch} from '../types'

import * as constants from './constants'
import {
    CurrentUsage,
    Invoice,
    PaymentMethod,
    CurrentProductsUsages,
} from './types'

/**
 * Update an invoice in the list of invoices.
 */
export const updateInvoiceInList = (
    invoice: Map<any, any>
): ReturnType<StoreDispatch> => {
    return {
        type: constants.UPDATE_INVOICE_IN_LIST,
        invoice,
    }
}

export function fetchCurrentUsage() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<CurrentUsage>('/api/billing/current-usage')
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_CURRENT_USAGE_SUCCESS,
                        resp,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.FETCH_CURRENT_USAGE_ERROR,
                        error,
                        reason: 'Unable to get current usage information.',
                    })
                }
            )
    }
}

export function fetchCurrentProductsUsage() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<CurrentProductsUsages>('/billing/products-usages')
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS,
                        resp,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.FETCH_CURRENT_PRODUCTS_USAGE_ERROR,
                        error,
                        reason: 'Unable to get current usage information.',
                    })
                }
            )
    }
}

export function fetchInvoices() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<ApiListResponsePagination<Invoice[]>>('/api/billing/invoices/')
            .then((json) => json?.data?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_INVOICES_SUCCESS,
                        resp,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.FETCH_INVOICES_ERROR,
                        error,
                        reason: 'Unable to get invoices.',
                    })
                }
            )
    }
}

export function fetchPaymentMethod() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<PaymentMethod>('/api/billing/payment-method/')
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_PAYMENT_METHOD_SUCCESS,
                        resp,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.FETCH_PAYMENT_METHOD_ERROR,
                        error,
                        reason: 'Failed to get payment method information.',
                    })
                }
            )
    }
}
