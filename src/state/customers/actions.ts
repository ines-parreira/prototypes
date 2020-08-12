import axios, {AxiosError} from 'axios'
import _isUndefined from 'lodash/isUndefined'
import {List} from 'immutable'
import {updateNotification} from 'reapop'

import * as viewsConfig from '../../config/views.js'

import {ApiListResponsePagination} from '../../models/api/types'
import {Ticket} from '../../models/ticket/types'
import {notify} from '../notifications/actions.js'
import {NotificationStatus} from '../notifications/types'
import type {StoreDispatch, RootState} from '../types'

import * as types from './constants.js'
import {mergeChannels} from './helpers'
import {Customer, CustomerDraft} from './types'

export function fetchCustomer(customerId: number) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.FETCH_CUSTOMER_START,
        })

        return axios
            .get<Customer>(`/api/customers/${customerId}/`)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: types.FETCH_CUSTOMER_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: types.FETCH_CUSTOMER_ERROR,
                        error,
                        reason: 'Failed to fetch customer',
                    })
                }
            )
    }
}

export function submitCustomer(data: CustomerDraft, customerId: number) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const isUpdate = !_isUndefined(customerId)
        let promise

        dispatch({
            type: types.SUBMIT_CUSTOMER_START,
        })

        if (isUpdate) {
            promise = axios.put<CustomerDraft>(
                `/api/customers/${customerId}/`,
                data
            )
        } else {
            promise = axios.post<CustomerDraft>('/api/customers/', data)
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

        return axios.delete(`/api/customers/${customerId}/`).then(
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
        const viewConfig = viewsConfig.getConfigByType(activeViewType) as Map<
            any,
            any
        >

        const notification = dispatch(
            notify({
                status: NotificationStatus.Info,
                dismissAfter: 0,
                message: `Deleting ${viewConfig.get('plural') as string}...`,
            })
        ) as Promise<any> & {status: NotificationStatus; message: string}

        return axios
            .delete(`/api/${viewConfig.get('api') as string}/`, {data: {ids}})
            .then(
                () => {
                    notification.status = NotificationStatus.Success
                    notification.message = `${ids.size} ${
                        viewConfig.get('plural') as string
                    } successfully deleted!`
                    dispatch({
                        type: types.BULK_DELETE_SUCCESS,
                        viewType: activeViewType,
                        ids,
                    })
                    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    void dispatch(updateNotification(notification))
                },
                () => {
                    notification.status = NotificationStatus.Error
                    notification.message = `Couldn\'t delete selected ${
                        viewConfig.get('plural') as string
                    }`
                    dispatch({type: types.BULK_DELETE_ERROR})
                    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    void dispatch(updateNotification(notification))
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

        return axios
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
                (error: AxiosError<{response?: {status: number}}>) => {
                    // TODO(customers-migration): remove these lines when the migration is done
                    if (
                        error &&
                        error.response &&
                        error.response.status === 404
                    ) {
                        return Promise.resolve()
                    }

                    return (dispatch({
                        type: types.FETCH_CUSTOMER_HISTORY_ERROR,
                        error,
                        reason:
                            "Couldn't fetch customer's tickets. Please try again in a few minutes.",
                    }) as unknown) as Promise<void>
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

        return axios
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
                        reason:
                            "Couldn't merge customers. Please try again in a few minutes.",
                    })
                }
            )
    }
}
