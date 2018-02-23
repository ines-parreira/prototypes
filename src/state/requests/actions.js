// @flow
import axios from 'axios'

import * as constants from './constants'
import {notify} from '../notifications/actions'

import type {dispatchType, thunkActionType} from '../types'

type Request = {
    id: number,
    name: string,
    samples: string,
}

export const fetchRequests = (): thunkActionType => (dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.FETCH_REQUEST_LIST_START
    })

    return axios.get('/api/requests/')
        .then((json = {}) => json.data)
        .then((resp) => {
            return dispatch({
                type: constants.FETCH_REQUEST_LIST_SUCCESS,
                resp
            })
        }, (error) => {
            return dispatch({
                type: constants.FETCH_REQUEST_LIST_ERROR,
                error,
                reason: 'Failed to fetch requests'
            })
        })
}

export const createRequest = (request: Request): thunkActionType => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.post('/api/requests/', request)
        .then((json = {}) => json.data)
        .then((resp) => {
            dispatch(notify({
                status: 'success',
                message: 'Request created'
            }))

            return dispatch({
                type: constants.CREATE_REQUEST_SUCCESS,
                resp
            })
        }, (error) => {
            return dispatch({
                type: constants.CREATE_REQUEST_ERROR,
                error,
                reason: 'Failed to create request'
            })
        })
}

export const updateRequest = (requestId: number, request: Request): thunkActionType => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.put(`/api/requests/${requestId}/`, request)
        .then((json = {}) => json.data)
        .then((resp) => {
            dispatch(notify({
                status: 'success',
                message: 'Request updated'
            }))

            return dispatch({
                type: constants.UPDATE_REQUEST_SUCCESS,
                resp
            })
        }, (error) => {
            return dispatch({
                type: constants.UPDATE_REQUEST_ERROR,
                error,
                reason: 'Failed to update request'
            })
        })
}

export const deleteRequest = (requestId: number): thunkActionType => (dispatch: dispatchType): Promise<dispatchType | Object> => {
    return axios.delete(`/api/requests/${requestId}/`)
        .then((json = {}) => json.data)
        .then((resp) => {
            dispatch(notify({
                status: 'success',
                message: 'Request deleted'
            }))
            return dispatch({
                type: constants.DELETE_REQUEST_SUCCESS,
                resp
            })
        }, (error) => {
            return dispatch({
                type: constants.DELETE_REQUEST_ERROR,
                error,
                reason: 'Failed to delete request'
            })
        })
}

export const bulkDeleteRequest = (requestIds: Array<number>): thunkActionType => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.delete('/api/requests/', {data: {ids: requestIds}})
        .then((json = {}) => json.data)
        .then(() => {
            dispatch(notify({
                status: 'success',
                message: 'Requests deleted'
            }))

            return dispatch({
                type: constants.DELETE_BULK_REQUEST_SUCCESS,
                requestIds
            })
        }, (error) => {
            return dispatch({
                type: constants.DELETE_REQUEST_ERROR,
                error,
                reason: 'Failed to delete requests'
            })
        })
}
