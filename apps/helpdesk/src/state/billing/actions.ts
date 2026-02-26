import type { Map } from 'immutable'

import client from '../../models/api/resources'
import type { StoreDispatch } from '../types'
import * as constants from './constants'
import type { PaymentMethod } from './types'

/**
 * Update an invoice in the list of invoices.
 */
export const updateInvoiceInList = (invoice: Map<any, any>) => {
    return {
        type: constants.UPDATE_INVOICE_IN_LIST,
        invoice,
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
                },
            )
    }
}
