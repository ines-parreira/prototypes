// @flow
import axios from 'axios'

import type {Dispatch, thunkActionType} from '../types'

import {FETCH_USERS_AUDIT_SUCCESS, FETCH_USERS_AUDIT_ERROR} from './constants'

export const fetchUsersAudit = (params: Object): thunkActionType => {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        return axios
            .get('/api/users/audit/', {params})
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    dispatch({
                        type: FETCH_USERS_AUDIT_SUCCESS,
                        events: resp.data,
                        meta: resp.meta,
                    })
                    return Promise.resolve(resp)
                },
                (error) => {
                    return dispatch({
                        type: FETCH_USERS_AUDIT_ERROR,
                        error,
                        reason: 'Failed to fetch user audit logs',
                    })
                }
            )
    }
}
