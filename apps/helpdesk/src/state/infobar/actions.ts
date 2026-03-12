import { history } from '@repo/routing'
import type { AxiosError, AxiosResponse, CancelToken } from 'axios'
import { isCancel } from 'axios'
import _noop from 'lodash/noop'

import client from 'models/api/resources'
import { searchCustomers } from 'models/customer/resources'
import type { Customer } from 'models/customer/types'
import type { ActionExecutedEvent } from 'services/socketManager/types'
import * as constants from 'state/infobar/constants'
import * as utils from 'state/infobar/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'
import { onApiError } from 'state/utils'
import { isCurrentlyOnTicket, stripErrorMessage } from 'utils'

export const searchWithHighlights =
    (query: string, cancelToken?: CancelToken) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.SEARCH_CUSTOMERS_START,
        })

        return searchCustomers({
            search: query,
            withHighlights: true,
            cancelToken,
        }).then(
            (resp) => {
                return dispatch({
                    type: constants.SEARCH_CUSTOMERS_SUCCESS,
                    resp,
                })
            },
            (error: AxiosError) => {
                if (isCancel(error)) {
                    return Promise.resolve()
                }
                return dispatch({
                    type: constants.SEARCH_CUSTOMERS_ERROR,
                    error,
                    reason: 'Failed to do the search. Please try again...',
                }) as unknown as Promise<void>
            },
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
                },
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
                        response?: { status: number }
                        error?: { msg?: string }
                    }>,
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
                },
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
        appId,
        customerId,
        payload = {},
        callback = _noop,
    }: {
        actionName: string
        actionLabel?: string
        integrationId: string | number | null
        appId?: string | null
        customerId?: string
        payload?: utils.ActionDataPayload
        callback?: (response?: AxiosResponse) => void
    }) =>
    (dispatch: StoreDispatch, getState: () => RootState): string => {
        const state = getState()
        const { ticket } = state
        const ticketId = ticket.get('id') as number | undefined
        const ticketCustomerId = ticket.getIn(['customer', 'id']) as
            | number
            | undefined

        const actionId = utils.actionButtonHashForData({
            action_name: actionName,
            user_id: customerId || ticketCustomerId?.toString(),
            integration_id: integrationId?.toString(),
            app_id: appId || undefined,
            payload,
        })

        const data: utils.ActionData = {
            action_name: actionName,
            action_label: actionLabel,
            action_id: actionId,
            user_id: customerId || ticketCustomerId?.toString(),
            ticket_id: ticketId?.toString(),
            integration_id: integrationId?.toString(),
            app_id: appId || undefined,
            payload,
        }

        void dispatch(
            notify({
                status: NotificationStatus.Loading,
                dismissAfter: 0,
                closeOnNext: true,
                message: 'Executing action...',
            }),
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
                    reason: `Failed to execute action ${actionName} on customer #${
                        customerId || ''
                    }${
                        integrationId ? ` for integration ${integrationId}` : ''
                    }`,
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
            let buttons = []
            if (response.user_id !== undefined) {
                buttons.push({
                    primary: true,
                    name: 'Review',
                    onClick: () => {
                        history.push(`/app/customer/${response.user_id || ''}`)
                    },
                })
            }

            const ticketId = response.ticket_id
            if (ticketId) {
                if (isCurrentlyOnTicket(ticketId)) {
                    buttons = []
                } else {
                    buttons = []
                    buttons.push({
                        primary: true,
                        name: 'Review',
                        onClick: () => {
                            history.push(`/app/ticket/${ticketId}`)
                        },
                    })
                }
            }

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: 'Something went wrong on your last action 😞',
                    dismissAfter: 0,
                    message: stripErrorMessage(response.msg),
                    buttons,
                }),
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
                title: response.msg
                    ? response.msg
                    : 'Action successfully executed',
            }),
        )

        return dispatch({
            type: constants.EXECUTE_ACTION_SUCCESS,
            data: response,
            id: actionId,
        })
    }
