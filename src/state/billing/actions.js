import axios from 'axios'
import {browserHistory} from 'react-router'
import * as types from './constants'

export function fetchCurrentUsage() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_CURRENT_USAGE_START
        })

        return axios.get('/api/billing/current-usage/')
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: types.FETCH_CURRENT_USAGE_SUCCESS,
                resp
            })
        }, error => {
            dispatch({
                type: types.FETCH_CURRENT_USAGE_ERROR,
                error,
                reason: 'Unable to get current usage information.'
            })
        })
    }
}

export function fetchInvoices() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_INVOICES_START
        })

        return axios.get('/api/billing/invoices/')
            .then((json = {}) => json.data.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_INVOICES_SUCCESS,
                    resp
                })
            }, error => {
                dispatch({
                    type: types.FETCH_INVOICES_ERROR,
                    error,
                    reason: 'Unable to get invoices.'
                })
            })
    }
}

export function fetchCreditCard() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_CREDIT_CARD_START
        })

        return axios.get('/api/billing/credit-card/')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_CREDIT_CARD_SUCCESS,
                    resp
                })
            }, error => {
                dispatch({
                    type: types.FETCH_CREDIT_CARD_ERROR,
                    error,
                    reason: 'Unable to get credit card information.'
                })
            })
    }
}

export function updateCreditCard(creditCard) {
    return (dispatch) => {
        dispatch({
            type: types.UPDATE_CREDIT_CARD_START
        })

        if (Stripe) {
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
                    dispatch({
                        type: types.UPDATE_CREDIT_CARD_ERROR,
                        error: response.error,
                        reason: 'Unable to update credit card.'
                    })
                } else {
                    // send the token of the card to our API
                    return axios.put('/api/billing/credit-card/', {
                        token: response.id
                    })
                        .then((json = {}) => json.data)
                        .then(resp => {
                            dispatch({
                                type: types.UPDATE_CREDIT_CARD_SUCCESS,
                                resp
                            })
                            browserHistory.push('/app/settings/billing/')
                        }, error => {
                            dispatch({
                                type: types.UPDATE_CREDIT_CARD_ERROR,
                                error,
                                reason: 'Unable to update credit card.'
                            })
                        })
                }
            })
        } else {
            dispatch({
                type: types.UPDATE_CREDIT_CARD_ERROR,
                reason: 'Unable to update credit card. Please reload this page.'
            })
        }
    }
}
