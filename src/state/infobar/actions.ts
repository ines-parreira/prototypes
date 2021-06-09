import axios, {CancelToken, AxiosError, AxiosResponse} from 'axios'
import _noop from 'lodash/noop'

import {notify} from '../notifications/actions'
import {isCurrentlyOnTicket, stripErrorMessage} from '../../utils'

import {ApiListResponsePagination} from '../../models/api/types'
import history from '../../pages/history'
import {Customer} from '../customers/types'
import {NotificationStatus} from '../notifications/types'
import {StoreDispatch, RootState} from '../types'

import * as constants from './constants.js'

export const search = (query: string, cancelToken?: CancelToken) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    dispatch({
        type: constants.SEARCH_CUSTOMERS_START,
    })
    const options = cancelToken ? {cancelToken} : {}

    return axios
        .post<ApiListResponsePagination<Customer>>(
            '/api/search/',
            {type: 'user_profile', query},
            options
        )
        .then((json) => json?.data)
        .then(
            (resp) => {
                return dispatch({
                    type: constants.SEARCH_CUSTOMERS_SUCCESS,
                    resp,
                })
            },
            (error: AxiosError) => {
                if (axios.isCancel(error)) {
                    return Promise.resolve()
                }
                return (dispatch({
                    type: constants.SEARCH_CUSTOMERS_ERROR,
                    error,
                    reason: 'Failed to do the search. Please try again...',
                }) as unknown) as Promise<void>
            }
        )
}

export const similarCustomer = (customerId: string) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    dispatch({
        type: constants.SEARCH_SIMILAR_CUSTOMER_START,
    })

    return axios
        .get<Customer>(`/api/customers/${customerId}/similar/`)
        .then((json) => json?.data)
        .then(
            (resp) => {
                return dispatch({
                    type: constants.SEARCH_SIMILAR_CUSTOMER_SUCCESS,
                    customer: resp,
                })
            },
            (error: AxiosError) => {
                if (error && error.response && error.response.status === 404) {
                    return Promise.resolve()
                }

                return (dispatch({
                    type: constants.SEARCH_SIMILAR_CUSTOMER_ERROR,
                    reason:
                        'Failed to search for similar customers. Please try again...',
                }) as unknown) as Promise<void>
            }
        )
}

export const fetchPreviewCustomer = (customerId: string) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    dispatch({
        type: constants.FETCH_PREVIEW_CUSTOMER_START,
    })

    return axios
        .get<Customer>(`/api/customers/${customerId}/`)
        .then((json) => json?.data)
        .then(
            (resp) => {
                return dispatch({
                    type: constants.FETCH_PREVIEW_CUSTOMER_SUCCESS,
                    resp,
                })
            },
            (error: AxiosError) => {
                return dispatch({
                    type: constants.FETCH_PREVIEW_CUSTOMER_ERROR,
                    error,
                    reason:
                        "Couldn't fetch the customer. Please try again in a few minutes.",
                })
            }
        )
}

/**
 * Send action from infobar button to server
 */
export const executeAction = (
    actionName: string,
    integrationId: string,
    customerId?: string,
    payload: {
        order_id?: Maybe<number>
        customer_id?: number
        comment_id?: number
        draft_order_id?: number
        draft_order_name?: string
        draft_order_invoice?: unknown
        facebook_comment?: string
        tags_list?: string
        instagram_comment?: string
        messenger_reply?: string
        instagram_direct_message_reply?: string
        from_ticket_message_id?: number
    } = {},
    callback: (response?: AxiosResponse) => void = _noop
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const state = getState()
    const {ticket} = state

    const ticketId = ticket.get('id') as number

    const data = {
        action_name: actionName,
        user_id: customerId,
        ticket_id: ticketId,
        integration_id: integrationId,
        payload,
    }

    void dispatch(
        notify({
            status: NotificationStatus.Loading,
            dismissAfter: 0,
            closeOnNext: true,
            message: 'Executing action...',
        })
    )

    dispatch({
        type: constants.EXECUTE_ACTION_START,
        data,
        callback,
    })

    return axios.post('/api/actions/execute/', data).then(
        () => {
            return Promise.resolve()
        },
        (error: AxiosError) => {
            return dispatch({
                type: constants.EXECUTE_ACTION_ERROR,
                data,
                error,
                reason:
                    `Failed to execute action ${actionName} on customer #${
                        customerId || ''
                    } ` + `for integration ${integrationId}`,
            })
        }
    )
}

/**
 * Handle asynchronous result from an executed action from server (returned by socket)
 */
export const handleExecutedAction = (response: {
    status: string
    user_id: string
    ticket_id: string
    msg: string
}) => (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
    if (response.status === 'error') {
        let buttons = [
            {
                primary: true,
                name: 'Review',
                onClick: () => {
                    history.push(`/app/customer/${response.user_id}`)
                },
            },
        ]

        if (response.ticket_id) {
            if (isCurrentlyOnTicket(response.ticket_id)) {
                buttons = []
            } else {
                buttons[0].onClick = () => {
                    history.push(`/app/ticket/${response.ticket_id}`)
                }
            }
        }

        void dispatch(
            notify({
                status: NotificationStatus.Error,
                title: 'Something went wrong on your last action 😞',
                dismissAfter: 0,
                message: stripErrorMessage(response.msg),
                buttons,
            })
        )

        return dispatch({
            type: constants.EXECUTE_ACTION_ERROR,
            data: response,
        })
    }

    void dispatch(
        notify({
            status: NotificationStatus.Success,
            title: 'Action successfully executed',
        })
    )

    return dispatch({
        type: constants.EXECUTE_ACTION_SUCCESS,
        data: response,
    })
}
