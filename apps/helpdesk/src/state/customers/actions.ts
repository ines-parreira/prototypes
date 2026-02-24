import { history } from '@repo/routing'
import type { AxiosError } from 'axios'
import type { List } from 'immutable'
import _isUndefined from 'lodash/isUndefined'
import { notify as updateNotification } from 'reapop'
import type { UpsertNotificationAction } from 'reapop/dist/reducers/notifications/actions'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import * as viewsConfig from 'config/views'
import client from 'models/api/resources'
import type { Customer, CustomerDraft } from 'models/customer/types'
import { ViewType } from 'models/view/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'
import { onApiError } from 'state/utils'
import { isCurrentlyOnCustomerPage } from 'utils'

import * as types from './constants'
import { mergeChannels } from './helpers'

export function fetchCustomer(customerId: string | number) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.FETCH_CUSTOMER_START,
        })

        return client
            .get<Customer>(`/api/customers/${customerId}/`)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    if (isCurrentlyOnCustomerPage(customerId)) {
                        const wasRedirected =
                            resp?.id && Number(customerId) !== resp?.id

                        if (wasRedirected) {
                            history.push(`/app/customer/${resp?.id}`)
                        }
                    }

                    return dispatch({
                        type: types.FETCH_CUSTOMER_SUCCESS,
                        resp,
                    })
                },
                (
                    error: AxiosError<{
                        response?: { status: number }
                        error?: { msg?: string }
                    }>,
                ) => {
                    const reason = 'Failed to fetch customer'
                    // TODO(customers-migration): remove this condition when the migration is done
                    if (error.response?.status === 404) {
                        return dispatch(
                            onApiError(error, reason, {
                                type: types.FETCH_CUSTOMER_ERROR,
                            }),
                        )
                    }
                    return dispatch({
                        type: types.FETCH_CUSTOMER_ERROR,
                        error,
                        reason,
                    }) as unknown as Promise<void>
                },
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
                `/api/customers/${customerId}/`,
                data,
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
                        }),
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
                },
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
                    }),
                )
            },
            (error: AxiosError) => {
                return dispatch({
                    type: types.DELETE_CUSTOMER_ERROR,
                    error,
                    reason: 'Failed to update the customer',
                })
            },
        )
    }
}

export function bulkDeleteCustomer(ids: List<any>) {
    return (dispatch: StoreDispatch): Promise<void> => {
        dispatch({
            type: types.BULK_DELETE_START,
        })

        const activeViewType = ViewType.CustomerList
        const viewConfig = viewsConfig.getConfigByType(activeViewType)

        const notification = dispatch(
            notify({
                status: NotificationStatus.Info,
                dismissAfter: 0,
                message: `Deleting ${viewConfig.get('plural') as string}...`,
            }),
        ) as unknown as UpsertNotificationAction

        return client
            .delete(`/api/${viewConfig.get('api') as string}/`, {
                data: { ids },
            })
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
                    dispatch({ type: types.BULK_DELETE_ERROR })
                    void dispatch(updateNotification(notification.payload))
                },
            )
    }
}

export function mergeCustomers(
    baseCustomerId: number,
    mergeCustomerId: number,
    data: Customer,
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.MERGE_CUSTOMERS_START,
        })

        data.channels = mergeChannels(data.channels)

        return client
            .put<Customer>(
                `/api/customers/merge?target_id=${baseCustomerId}&source_id=${mergeCustomerId}`,
                data,
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type: types.MERGE_CUSTOMERS_SUCCESS,
                        resp,
                    })

                    appQueryClient.removeQueries({
                        queryKey:
                            queryKeys.customers.getCustomer(baseCustomerId),
                    })
                    appQueryClient.removeQueries({
                        queryKey:
                            queryKeys.customers.getCustomer(mergeCustomerId),
                    })

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Customers successfully merged.',
                        }),
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
                },
            )
    }
}
