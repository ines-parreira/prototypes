// @flow

import axios from 'axios'
import {browserHistory} from 'react-router'
import _noop from 'lodash/noop'

import {notify} from '../notifications/actions'
import {isCurrentlyOnTicket, stripErrorMessage} from '../../utils'

import type {dispatchType, getStateType, thunkActionType} from '../types'

import * as constants from './constants'

type responseType = {
    status: string,
    user_id: string,
    ticket_id: string,
    msg: string
}

export const search = (query: string): thunkActionType => ((dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.SEARCH_CUSTOMERS_START,
    })

    return axios.post('/api/search/', {type: 'user_profile', query})
        .then((json = {}) => json.data)
        .then((resp) => {
            return dispatch({
                type: constants.SEARCH_CUSTOMERS_SUCCESS,
                resp,
            })
        }, (error) => {
            return dispatch({
                type: constants.SEARCH_CUSTOMERS_ERROR,
                error,
                reason: 'Failed to do the search. Please try again...'
            })
        })
})

export const similarCustomer = (
    customerId: string,
): thunkActionType => ((dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.SEARCH_SIMILAR_CUSTOMER_START
    })

    return axios.get(`/api/customers/${customerId}/similar/`)
        .then((json = {}) => json.data)
        .then((resp) => {
            return dispatch({
                type: constants.SEARCH_SIMILAR_CUSTOMER_SUCCESS,
                customer: resp,
            })
        }, (error) => {
            // TODO(customers-migration): remove these lines when the migration is done
            if (error && error.response && error.response.status === 404) {
                if (window.Raven){
                    window.Raven.captureMessage('Agent has a customer profile', {
                        level: 'error',
                        extra: {
                            customerId
                        }
                    })
                }
                return Promise.resolve()
            }

            return dispatch({
                type: constants.SEARCH_SIMILAR_CUSTOMER_ERROR,
                reason: 'Failed to search for similar customers. Please try again...'
            })
        })
})

export const fetchPreviewCustomer = (
    customerId: string,
): thunkActionType => ((dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.FETCH_PREVIEW_CUSTOMER_START
    })

    return axios.get(`/api/customers/${customerId}/`)
        .then((json = {}) => json.data)
        .then((resp) => {
            return dispatch({
                type: constants.FETCH_PREVIEW_CUSTOMER_SUCCESS,
                resp
            })
        }, (error) => {
            return dispatch({
                type: constants.FETCH_PREVIEW_CUSTOMER_ERROR,
                error,
                reason: 'Couldn\'t fetch the customer. Please try again in a few minutes.'
            })
        })
})

/**
 * Send action from infobar button to server
 * @param actionName
 * @param integrationId
 * @param customerId
 * @param payload
 * @param callback
 */
export const executeAction = (
    actionName: string,
    integrationId: string,
    customerId?: string,
    payload: {} = {},
    callback: () => void = _noop,
) => ((dispatch: dispatchType, getState: getStateType): Promise<dispatchType> => {

    const state = getState()
    const {ticket} = state

    const ticketId = ticket.get('id')

    const data = {
        action_name: actionName,
        user_id: customerId,
        ticket_id: ticketId,
        integration_id: integrationId,
        payload,
    }

    dispatch(notify({
        status: 'loading',
        dismissAfter: 0,
        closeOnNext: true,
        message: 'Executing action...'
    }))

    dispatch({
        type: constants.EXECUTE_ACTION_START,
        data,
        callback,
    })

    return axios.post('/api/actions/execute/', data)
        .then((json = {}) => json.data)
        .then(() => {
            return Promise.resolve()
        }, (error) => {
            return dispatch({
                type: constants.EXECUTE_ACTION_ERROR,
                data,
                error,
                reason: `Failed to execute action ${actionName} on customer #${customerId || ''} `
                    + `for integration ${integrationId}`
            })
        })
})

/**
 * Handle asynchronous result from an executed action from server (returned by socket)
 * @param response
 */
export const handleExecutedAction = (response: responseType) => ((dispatch: dispatchType): Promise<dispatchType> => {
    if (response.status === 'error') {
        let buttons = [{
            primary: true,
            name: 'Review',
            onClick: () => {
                browserHistory.push(`/app/customer/${response.user_id}`)
            }
        }]

        if (response.ticket_id) {
            if (isCurrentlyOnTicket(response.ticket_id)) {
                buttons = []
            } else {
                buttons[0].onClick = () => {
                    browserHistory.push(`/app/ticket/${response.ticket_id}`)
                }
            }
        }

        dispatch(notify({
            status: 'error',
            title: 'Something went wrong on your last action 😞',
            dismissAfter: 0,
            message: stripErrorMessage(response.msg),
            buttons,
        }))

        return dispatch({
            type: constants.EXECUTE_ACTION_ERROR,
            data: response,
        })
    }

    dispatch(notify({
        status: 'success',
        title: 'Action successfully executed',
    }))

    return dispatch({
        type: constants.EXECUTE_ACTION_SUCCESS,
        data: response,
    })
})
