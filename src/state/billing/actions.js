import axios from 'axios'
import {browserHistory} from 'react-router'
import {notify} from '../notifications/actions'
import * as types from './constants'

export function fetchCurrentUsage() {
    return (dispatch) => {
        return axios.get('/api/billing/current-usage/')
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch({
                    type: types.FETCH_CURRENT_USAGE_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: types.FETCH_CURRENT_USAGE_ERROR,
                    error,
                    reason: 'Unable to get current usage information.'
                })
            })
    }
}

export function fetchInvoices() {
    return (dispatch) => {
        return axios.get('/api/billing/invoices/')
            .then((json = {}) => json.data.data)
            .then((resp) => {
                return dispatch({
                    type: types.FETCH_INVOICES_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: types.FETCH_INVOICES_ERROR,
                    error,
                    reason: 'Unable to get invoices.'
                })
            })
    }
}


export function fetchPaymentMethod() {
    return (dispatch) => {
        return axios.get('/api/billing/payment-method/')
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch({
                    type: types.FETCH_PAYMENT_METHOD_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: types.FETCH_PAYMENT_METHOD_ERROR,
                    error,
                    reason: 'Failed to get payment method information.'
                })
            })
    }
}

export function fetchCreditCard() {
    return (dispatch) => {
        return axios.get('/api/billing/credit-card/')
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch({
                    type: types.FETCH_CREDIT_CARD_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: types.FETCH_CREDIT_CARD_ERROR,
                    error,
                    reason: 'Unable to get credit card information.'
                })
            })
    }
}

export function updateCreditCard(creditCard) {
    return (dispatch) => {
        if (Stripe) {
            return new Promise((resolve) => {
                const expiry = creditCard.expDate.split('/')
                // call directly Stripe API from client browser to create a token for the card

                Stripe.card.createToken({
                    name: creditCard.name,
                    number: creditCard.number,
                    cvc: creditCard.cvc,
                    exp_month: expiry[0].trim(),
                    exp_year: expiry[1].trim()
                }, (status, response) => {
                    if (response.error) {
                        resolve(response)
                        return dispatch({
                            type: types.UPDATE_CREDIT_CARD_ERROR,
                            error: response.error,
                            reason: 'Unable to update credit card.'
                        })
                    }
                    // send the token of the card to our API
                    return axios.put('/api/billing/credit-card/', {
                        token: response.id
                    })
                        .then((json = {}) => json.data)
                        .then((resp) => {
                            resolve(resp)
                            dispatch(notify({
                                status: 'success',
                                message: 'Your payment info was updated',
                            }))
                            browserHistory.push('/app/settings/billing/')
                            return dispatch({
                                type: types.UPDATE_CREDIT_CARD_SUCCESS,
                                resp
                            })
                        }, (error) => {
                            resolve(error)
                            return dispatch({
                                type: types.UPDATE_CREDIT_CARD_ERROR,
                                error,
                                reason: 'Unable to update credit card.'
                            })
                        })
                })

            })
        } else {
            return dispatch({
                type: types.UPDATE_CREDIT_CARD_ERROR,
                reason: 'Unable to update credit card. Please reload this page.'
            })
        }
    }
}

export function updateSubscription(subscription) {
    return (dispatch) => {
        return axios.put('/api/billing/subscription/', subscription)
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch(notify({
                    status: 'success',
                    message: 'Your subscription was updated.',
                }))
                return dispatch({
                    type: types.UPDATE_SUBSCRIPTION_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: types.UPDATE_SUBSCRIPTION_ERROR,
                    error,
                    reason: 'Failed to update the current subscription.'
                })
            })
    }
}
