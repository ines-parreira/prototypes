import type {List} from 'immutable'
import axios from 'axios'
import {updateNotification} from 'reapop'

import {notify} from '../notifications/actions'
import type {dispatchType, thunkActionType} from '../types'
import {buildChangesMessage} from '../../utils/notificationUtils'

import * as types from'./constants'


export const updateCursor = (cursor) => (dispatch) => {
    return dispatch({
        type: types.UPDATE_CURSOR,
        cursor
    })
}

export function bulkUpdate(ids: List<*>, key: string, jobPartialParams: Object): thunkActionType {
    return (dispatch: dispatchType): Promise<dispatchType> => {

        const requestPayload = {
            'type': key,
            'params': Object.assign({}, {'ticket_ids': ids.toJS()}, jobPartialParams)
        }

        const notification = dispatch(notify({
            status: 'loading',
            dismissAfter: 0,
            closeOnNext: true,
            message: buildChangesMessage(false,
                ids.size === 1 ? 'ticket' : 'tickets',
                jobPartialParams,
                ids.size)
        }))

        return axios.post('/api/jobs/', requestPayload)
            .then((json = {}) => json.data)
            .then(() => {
                notification.status = 'success'
                return dispatch(updateNotification(notification))
            })
            .catch((error) => {
                notification.status = 'error'
                notification.message = 'Failed to modify tickets. Please try again.'
                dispatch(updateNotification(notification))
                throw error
            })
    }
}
