import axios, {CancelToken, AxiosError, AxiosResponse} from 'axios'
import _noop from 'lodash/noop'

import {notify} from '../notifications/actions'
import {isCurrentlyOnTicket, stripErrorMessage} from '../../utils'

import {ActionExecutedEvent} from '../../services/socketManager/types'
import client from '../../models/api/resources'
import {ApiListResponsePagination} from '../../models/api/types'
import history from '../../pages/history'
import {Customer} from '../customers/types'
import {NotificationStatus} from '../notifications/types'
import {StoreDispatch, RootState} from '../types'
import {onApiError} from '../utils'

import * as utils from './utils'
import * as constants from './constants'

export const search =
    (query: string, cancelToken?: CancelToken) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.SEARCH_CUSTOMERS_START,
        })
        const options = cancelToken ? {cancelToken} : {}

        return client
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
                    return dispatch({
                        type: constants.SEARCH_CUSTOMERS_ERROR,
                        error,
                        reason: 'Failed to do the search. Please try again...',
                    }) as unknown as Promise<void>
                }
            )
    }

export const similarCustomer =
    (customerId: string) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.SEARCH_SIMILAR_CUSTOMER_START,
        })

        return client
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
                    if (
                        error &&
                        error.response &&
                        error.response.status === 404
                    ) {
                        return Promise.resolve()
                    }

                    return dispatch({
                        type: constants.SEARCH_SIMILAR_CUSTOMER_ERROR,
                        reason: 'Failed to search for similar customers. Please try again...',
                    }) as unknown as Promise<void>
                }
            )
    }

export const fetchPreviewCustomer =
    (customerId: string) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.FETCH_PREVIEW_CUSTOMER_START,
        })

        return client
            .get<Customer>(`/api/customers/${customerId}/`)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_PREVIEW_CUSTOMER_SUCCESS,
                        resp,
                    })
                },
                (
                    error: AxiosError<{
                        response?: {status: number}
                        error?: {msg?: string}
                    }>
                ) => {
                    const reason =
                        "Couldn't fetch the customer. Please try again in a few minutes."
                    // TODO(customers-migration): remove these lines when the migration is done
                    if (error.response?.status === 404) {
                        return dispatch(onApiError(error, reason))
                    }

                    return dispatch({
                        type: constants.FETCH_PREVIEW_CUSTOMER_ERROR,
                        error,
                        reason,
                    }) as unknown as Promise<void>
                }
            )
    }

/**
 * Send action from infobar button to server
 */
export const executeAction =
    ({
        actionName,
        actionLabel,
        integrationId,
        customerId,
        payload = {},
        callback = _noop,
    }: {
        actionName: string
        actionLabel?: string
        integrationId: string | number
        customerId?: string
        payload?: utils.ActionDataPayload
        callback?: (response?: AxiosResponse) => void
    }) =>
    (dispatch: StoreDispatch, getState: () => RootState): string => {
        const state = getState()
        const {ticket} = state

        const ticketId = ticket.get('id') as number | undefined

        const actionId = utils.actionButtonHashForData({
            action_name: actionName,
            user_id: customerId || '',
            integration_id: integrationId.toString(),
            payload,
        })

        const data: utils.ActionData = {
            action_name: actionName,
            action_label: actionLabel,
            action_id: actionId,
            user_id: customerId || '',
            ticket_id: ticketId?.toString(),
            integration_id: integrationId.toString(),
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
            id: actionId,
        })

        client
            .post('/api/actions/execute/', data)
            .catch((error: AxiosError) => {
                return dispatch({
                    type: constants.EXECUTE_ACTION_ERROR,
                    data,
                    error,
                    id: actionId,
                    reason:
                        `Failed to execute action ${actionName} on customer #${
                            customerId || ''
                        } ` + `for integration ${integrationId}`,
                })
            })

        return actionId
    }

/**
 * Handle asynchronous result from an executed action from server (returned by socket)
 */
export const handleExecutedAction =
    (response: ActionExecutedEvent) =>
    (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        const actionId = response.action_id

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

            const ticketId = response.ticket_id
            if (ticketId) {
                if (isCurrentlyOnTicket(ticketId)) {
                    buttons = []
                } else {
                    buttons[0].onClick = () => {
                        history.push(`/app/ticket/${ticketId}`)
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
                id: actionId,
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
            id: actionId,
        })
    }
