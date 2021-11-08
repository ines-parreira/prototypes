import client from '../../models/api/resources'
import {ApiListResponsePagination} from '../../models/api/types'
import {StoreDispatch} from '../types'

import {FETCH_USERS_AUDIT_SUCCESS, FETCH_USERS_AUDIT_ERROR} from './constants'
import {UserAudit} from './types'

export const fetchUsersAudit = (params: Record<string, unknown>) => {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<ApiListResponsePagination<UserAudit>>('/api/users/audit/', {
                params,
            })
            .then((json) => json?.data)
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
