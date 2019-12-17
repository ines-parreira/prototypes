// @flow
import axios from 'axios'
import _isUndefined from 'lodash/isUndefined'
import type {List} from 'immutable'
import {updateNotification} from 'reapop'

import * as viewsConfig from '../../config/views'

import {notify} from '../notifications/actions'
import type {dispatchType, stateType, getStateType, thunkActionType} from '../types'

import * as types from './constants'
import {mergeChannels} from './helpers'


export function fetchCustomer(customerId: number) {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: types.FETCH_CUSTOMER_START
        })

        return axios.get(`/api/customers/${customerId}/`)
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch({
                    type: types.FETCH_CUSTOMER_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: types.FETCH_CUSTOMER_ERROR,
                    error,
                    reason: 'Failed to fetch customer'
                })
            })
    }
}

export function submitCustomer(data: {}, customerId: number) {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        const isUpdate = !_isUndefined(customerId)
        let promise

        dispatch({
            type: types.SUBMIT_CUSTOMER_START
        })

        if (isUpdate) {
            promise = axios.put(`/api/customers/${customerId}/`, data)
        } else {
            promise = axios.post('/api/customers/', data)
        }

        return promise
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch({
                    type: types.SUBMIT_CUSTOMER_SUCCESS,
                    isUpdate,
                    resp
                })

                dispatch(notify({
                    status: 'success',
                    message: `Customer successfully ${isUpdate ? 'updated' : 'created'}`
                }))

                return resp
            }, (error) => {
                return dispatch({
                    type: types.SUBMIT_CUSTOMER_ERROR,
                    error,
                    verbose: true,
                    reason: `Failed to ${isUpdate ? 'update' : 'create'} customer`
                })
            })
    }
}

export function deleteCustomer(customerId: number) {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: types.DELETE_CUSTOMER_START
        })

        return axios.delete(`/api/customers/${customerId}/`)
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch({
                    type: types.DELETE_CUSTOMER_SUCCESS,
                    customerId,
                    resp
                })

                dispatch(notify({
                    status: 'success',
                    message: 'Customer successfully deleted'
                }))
            }, (error) => {
                return dispatch({
                    type: types.DELETE_CUSTOMER_ERROR,
                    error,
                    reason: 'Failed to update the customer'
                })
            })
    }
}


export function bulkDeleteCustomer(ids: List<*>): thunkActionType {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: types.BULK_DELETE_START
        })

        const activeViewType = 'customer-list'
        const viewConfig = viewsConfig.getConfigByType(activeViewType)

        const notification = dispatch(notify({
            status: 'info',
            dismissAfter: 0,
            closeOnNext: true,
            message: `Deleting ${viewConfig.get('plural')}...`
        }))

        return axios.delete(`/api/${viewConfig.get('api')}/`, {data: {ids}}).then(() => {
            notification.status = 'success'
            notification.message = `${ids.size} ${viewConfig.get('plural')} successfully deleted!`
            dispatch({
                type: types.BULK_DELETE_SUCCESS,
                viewType: activeViewType,
                ids
            })
            return dispatch(updateNotification(notification))
        }, () => {
            notification.status = 'error'
            notification.message = `Couldn\'t delete selected ${viewConfig.get('plural')}`
            dispatch({type: types.BULK_DELETE_ERROR})
            return dispatch(updateNotification(notification))
        })
    }
}


export function fetchCustomerHistory(customerId: number, options: {successCondition?: (T: stateType) => boolean} = {}) {
    return (dispatch: dispatchType, getState: getStateType) => {
        dispatch({
            type: types.FETCH_CUSTOMER_HISTORY_START
        })

        return axios.get(`/api/customers/${customerId}/tickets/`)
            .then((json = {}) => json.data)
            .then((resp) => {
                const state = getState()

                let shouldTriggerSuccess = true
                if (options.successCondition) {
                    shouldTriggerSuccess = options.successCondition(state)
                }

                if (shouldTriggerSuccess) {
                    dispatch({
                        type: types.FETCH_CUSTOMER_HISTORY_SUCCESS,
                        resp
                    })
                }

                return Promise.resolve(resp)
            }, (error) => {
                // TODO(customers-migration): remove these lines when the migration is done
                if (error && error.response && error.response.status === 404) {
                    return Promise.resolve()
                }

                return dispatch({
                    type: types.FETCH_CUSTOMER_HISTORY_ERROR,
                    error,
                    reason: 'Couldn\'t fetch customer\'s tickets. Please try again in a few minutes.'
                })
            })
    }
}

export function mergeCustomers(baseCustomerId: number, mergeCustomerId: number, data: Object = {}) {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: types.MERGE_CUSTOMERS_START
        })

        data.channels = mergeChannels(data.channels)

        return axios.put(`/api/customers/merge?target_id=${baseCustomerId}&source_id=${mergeCustomerId}`, data)
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch({
                    type: types.MERGE_CUSTOMERS_SUCCESS,
                    resp
                })

                dispatch(notify({
                    status: 'success',
                    message: 'Customers successfully merged.'
                }))

                return Promise.resolve(resp)
            }, (error) => {
                return dispatch({
                    type: types.MERGE_CUSTOMERS_ERROR,
                    error,
                    verbose: true,
                    reason: 'Couldn\'t merge customers. Please try again in a few minutes.'
                })
            })
    }
}
