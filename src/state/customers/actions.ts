import {AxiosError} from 'axios'
import _isUndefined from 'lodash/isUndefined'
import {List} from 'immutable'
import {notify as updateNotification} from 'reapop'
import {UpsertNotificationAction} from 'reapop/dist/reducers/notifications/actions'

import * as viewsConfig from '../../config/views'

import client from '../../models/api/resources'
import {ApiListResponsePagination} from '../../models/api/types'
import {Ticket} from '../../models/ticket/types'
import {notify} from '../notifications/actions'
import {NotificationStatus} from '../notifications/types'
import type {StoreDispatch, RootState} from '../types'
import {onApiError} from '../utils'

import * as types from './constants'
import {mergeChannels} from './helpers'
import {Customer, CustomerDraft} from './types'

export function fetchCustomer(customerId: string) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.FETCH_CUSTOMER_START,
        })

        return client
            .get<Customer>(`/api/customers/${customerId}/`)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: types.FETCH_CUSTOMER_SUCCESS,
                        resp,
                    })
                },
                (
                    error: AxiosError<{
                        response?: {status: number}
                        error?: {msg?: string}
                    }>
                ) => {
                    const reason = 'Failed to fetch customer'
                    // TODO(customers-migration): remove this condition when the migration is done
                    if (error.response?.status === 404) {
                        return dispatch(
                            onApiError(error, reason, {
                                type: types.FETCH_CUSTOMER_ERROR,
                            })
                        )
                    }
                    return dispatch({
                        type: types.FETCH_CUSTOMER_ERROR,
                        error,
                        reason,
                    }) as unknown as Promise<void>
                }
            )
    }
}

export function submitCustomer(data: CustomerDraft, customerId?: number) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const isUpdate = !_isUndefined(customerId)
        let promise

        dispatch({
            type: types.SUBMIT_CUSTOMER_START,
        })

        if (isUpdate) {
            promise = client.put<CustomerDraft>(
                `/api/customers/${customerId!}/`,
                data
            )
        } else {
            promise = client.post<CustomerDraft>('/api/customers/', data)
        }

        return promise
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type: types.SUBMIT_CUSTOMER_SUCCESS,
                        isUpdate,
                        resp,
                    })

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: `Customer successfully ${
                                isUpdate ? 'updated' : 'created'
                            }`,
                        })
                    )

                    return resp
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: types.SUBMIT_CUSTOMER_ERROR,
                        error,
                        verbose: true,
                        reason: `Failed to ${
                            isUpdate ? 'update' : 'create'
                        } customer`,
                    })
                }
            )
    }
}

export function deleteCustomer(customerId: number) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.DELETE_CUSTOMER_START,
        })

        return client.delete(`/api/customers/${customerId}/`).then(
            () => {
                dispatch({
                    type: types.DELETE_CUSTOMER_SUCCESS,
                    customerId,
                })

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Customer successfully deleted',
                    })
                )
            },
            (error: AxiosError) => {
                return dispatch({
                    type: types.DELETE_CUSTOMER_ERROR,
                    error,
                    reason: 'Failed to update the customer',
                })
            }
        )
    }
}

export function bulkDeleteCustomer(ids: List<any>) {
    return (dispatch: StoreDispatch): Promise<void> => {
        dispatch({
            type: types.BULK_DELETE_START,
        })

        const activeViewType = 'customer-list'
        const viewConfig = viewsConfig.getConfigByType(activeViewType)

        const notification = dispatch(
            notify({
                status: NotificationStatus.Info,
                dismissAfter: 0,
                message: `Deleting ${viewConfig.get('plural') as string}...`,
            })
        ) as unknown as UpsertNotificationAction

        return client
            .delete(`/api/${viewConfig.get('api') as string}/`, {data: {ids}})
            .then(
                () => {
                    notification.payload.status = NotificationStatus.Success
                    notification.payload.message = `${ids.size} ${
                        viewConfig.get('plural') as string
                    } successfully deleted!`
                    dispatch({
                        type: types.BULK_DELETE_SUCCESS,
                        viewType: activeViewType,
                        ids,
                    })
                    void dispatch(updateNotification(notification.payload))
                },
                () => {
                    notification.payload.status = NotificationStatus.Error
                    notification.payload.message = `Couldn\'t delete selected ${
                        viewConfig.get('plural') as string
                    }`
                    dispatch({type: types.BULK_DELETE_ERROR})
                    void dispatch(updateNotification(notification.payload))
                }
            )
    }
}

export function fetchCustomerHistory(
    customerId: number,
    options: {successCondition?: (T: RootState) => boolean} = {}
) {
    return (dispatch: StoreDispatch, getState: () => RootState) => {
        dispatch({
            type: types.FETCH_CUSTOMER_HISTORY_START,
        })

        return client
            .get<ApiListResponsePagination<Ticket>>(
                `/api/customers/${customerId}/tickets/`
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    const state = getState()

                    let shouldTriggerSuccess = true
                    if (options.successCondition) {
                        shouldTriggerSuccess = options.successCondition(state)
                    }

                    if (shouldTriggerSuccess) {
                        dispatch({
                            type: types.FETCH_CUSTOMER_HISTORY_SUCCESS,
                            resp,
                        })
                    }

                    return Promise.resolve(resp)
                },
                (
                    error: AxiosError<{
                        response?: {status: number}
                        error?: {msg?: string}
                    }>
                ) => {
                    const reason =
                        "Couldn't fetch customer's tickets. Please try again in a few minutes."
                    // TODO(customers-migration): remove this condition when the migration is done
                    if (error.response?.status === 404) {
                        return dispatch(
                            onApiError(error, reason, {
                                type: types.FETCH_CUSTOMER_HISTORY_ERROR,
                            })
                        ) as unknown as Promise<void>
                    }
                    return dispatch({
                        type: types.FETCH_CUSTOMER_HISTORY_ERROR,
                        error,
                        reason,
                    }) as unknown as Promise<void>
                }
            )
    }
}

export function mergeCustomers(
    baseCustomerId: number,
    mergeCustomerId: number,
    data: Customer
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.MERGE_CUSTOMERS_START,
        })

        data.channels = mergeChannels(data.channels)

        return client
            .put<Customer>(
                `/api/customers/merge?target_id=${baseCustomerId}&source_id=${mergeCustomerId}`,
                data
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type: types.MERGE_CUSTOMERS_SUCCESS,
                        resp,
                    })

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Customers successfully merged.',
                        })
                    )

                    return Promise.resolve(resp)
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: types.MERGE_CUSTOMERS_ERROR,
                        error,
                        verbose: true,
                        reason: "Couldn't merge customers. Please try again in a few minutes.",
                    })
                }
            )
    }
}
