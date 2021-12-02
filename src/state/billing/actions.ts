import {Map} from 'immutable'

import client from '../../models/api/resources'
import {ApiListResponsePagination} from '../../models/api/types'
import {notify} from '../notifications/actions'
import {NotificationStatus} from '../notifications/types'
import {StoreDispatch} from '../types'

import * as constants from './constants'
import {
    BillingContactImmutable,
    CurrentUsage,
    Invoice,
    PaymentMethod,
    BillingContact,
} from './types'

/***
 * Set the future subscription plan.
 */
export const setFutureSubscriptionPlan = (planId: string) => {
    return {
        type: constants.SET_FUTURE_SUBSCRIPTION_PLAN,
        planId,
    }
}

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
            .get<CurrentUsage>('/api/billing/current-usage/')
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

export function fetchCreditCard() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<unknown>('/api/billing/credit-card/')
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_CREDIT_CARD_SUCCESS,
                        resp,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.FETCH_CREDIT_CARD_ERROR,
                        error,
                        reason: 'Unable to get credit card information.',
                    })
                }
            )
    }
}

/**
 * Set the credit card of the current account.
 *
 * @param creditCard - The data of the card.
 * @returns - A Redux action.
 */
export const setCreditCard = (
    creditCard: Map<any, any>
): ReturnType<StoreDispatch> => {
    return {
        type: constants.SET_CREDIT_CARD,
        creditCard,
    }
}

/**
 * Fetch the billing contact information for the current account
 * @returns {Promise} the async action promise
 */
export function fetchContact() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<BillingContact>('/api/billing/contact/')
            .then((json) => json?.data)
            .then(
                (billingContact) => {
                    return dispatch({
                        type: constants.FETCH_BILLING_CONTACT_SUCCESS,
                        billingContact,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.FETCH_BILLING_CONTACT_ERROR,
                        error,
                        reason: 'Unable to get billing contact information.',
                    })
                }
            )
    }
}

/**
 * Update the billing contact information for the current account
 * @param {billingContactType} billingContact - The billing contact object
 * @returns {Promise} the async action promise
 */
export function updateContact(billingContact: BillingContactImmutable) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .put<BillingContact>('/api/billing/contact/', billingContact.toJS())
            .then((json) => json?.data)
            .then(
                (billingContact) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Billing contact information updated',
                        })
                    )

                    return dispatch({
                        type: constants.UPDATE_BILLING_CONTACT_SUCCESS,
                        billingContact,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.UPDATE_BILLING_CONTACT_ERROR,
                        error,
                        reason: 'Unable to update billing contact information.',
                        verbose: true,
                    })
                }
            )
    }
}
