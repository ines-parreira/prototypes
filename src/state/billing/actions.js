// @flow
import axios from 'axios'
import {browserHistory} from 'react-router'
import {fromJS} from 'immutable'
import {notify} from '../notifications/actions'
import * as segmentTracker from '../../store/middlewares/segmentTracker'
import * as constants from './constants'

import type {dispatchType, getStateType} from '../types'
type creditCardType = {
    expDate: string,
    name: string,
    number: string,
    cvc: string
}

export function fetchCurrentUsage() {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.get('/api/billing/current-usage/')
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch({
                    type: constants.FETCH_CURRENT_USAGE_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: constants.FETCH_CURRENT_USAGE_ERROR,
                    error,
                    reason: 'Unable to get current usage information.'
                })
            })
    }
}

export function fetchInvoices() {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.get('/api/billing/invoices/')
            .then((json = {}) => json.data.data)
            .then((resp) => {
                return dispatch({
                    type: constants.FETCH_INVOICES_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: constants.FETCH_INVOICES_ERROR,
                    error,
                    reason: 'Unable to get invoices.'
                })
            })
    }
}

export function fetchPaymentMethod() {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.get('/api/billing/payment-method/')
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch({
                    type: constants.FETCH_PAYMENT_METHOD_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: constants.FETCH_PAYMENT_METHOD_ERROR,
                    error,
                    reason: 'Failed to get payment method information.'
                })
            })
    }
}

export function fetchCreditCard() {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.get('/api/billing/credit-card/')
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch({
                    type: constants.FETCH_CREDIT_CARD_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: constants.FETCH_CREDIT_CARD_ERROR,
                    error,
                    reason: 'Unable to get credit card information.'
                })
            })
    }
}

export function updateCreditCard(creditCard: creditCardType) {
    return (dispatch: dispatchType, getState: getStateType): Promise<{}> | dispatchType => {
        const state = getState()
        const hasCreditCard = !state.billing.get('creditCard', fromJS({})).isEmpty()
        const currentUser = state.currentUser
        const currentAccount = state.currentAccount

        // $FlowFixMe
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
                            type: constants.UPDATE_CREDIT_CARD_ERROR,
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
                            dispatch(notify({
                                status: 'success',
                                message: 'Your payment info was updated',
                            }))
                            browserHistory.push('/app/settings/billing/')
                            dispatch({
                                type: constants.UPDATE_CREDIT_CARD_SUCCESS,
                                resp
                            })

                            if (!hasCreditCard) {
                                segmentTracker.logEvent(segmentTracker.EVENTS.PAYMENT_METHOD_ADDED, {
                                    payment_method: 'stripe',
                                    user_id: currentUser.get('id'),
                                    account_domain: currentAccount.get('domain')
                                })
                            }

                            return resolve(resp)
                        }, (error) => {
                            dispatch({
                                type: constants.UPDATE_CREDIT_CARD_ERROR,
                                error,
                                reason: 'Unable to update credit card.'
                            })
                            return resolve(error)
                        })
                })

            })
        } else {
            return dispatch({
                type: constants.UPDATE_CREDIT_CARD_ERROR,
                reason: 'Unable to update credit card. Please reload this page.'
            })
        }
    }
}
