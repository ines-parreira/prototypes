import client from '../../models/api/resources'
import {ApiListResponsePagination} from '../../models/api/types'
import {StoreDispatch} from '../types'

import * as constants from './constants.js'
import {AuthItem} from './types'

export const fetchCurrentAuths = () => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return client
        .get<ApiListResponsePagination<AuthItem[]>>('/api/users/0/auths/')
        .then((json) => json?.data?.data)
        .then(
            (resp) => {
                return dispatch({
                    type: constants.FETCH_USER_AUTHS_SUCCESS,
                    resp,
                })
            },
            (error) => {
                return dispatch({
                    type: constants.FETCH_USER_AUTHS_ERROR,
                    error,
                    reason: 'Unable to get current authentification tokens.',
                })
            }
        )
}

export const resetApiKey = () => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return client
        .post<AuthItem>('/api/users/0/reset-key/')
        .then((json) => json?.data)
        .then(
            (resp) => {
                return dispatch({
                    type: constants.RESET_API_KEY_SUCCESS,
                    resp,
                })
            },
            (error) => {
                return dispatch({
                    type: constants.RESET_API_KEY_ERROR,
                    error,
                    reason: 'Unable to reset the API key.',
                })
            }
        )
}
