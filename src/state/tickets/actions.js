// @flow
import type {List} from 'immutable'
import axios from 'axios'
import {updateNotification} from 'reapop'

import {notify} from '../notifications/actions.ts'
import type {Dispatch, thunkActionType} from '../types'
import {buildJobMessage} from '../../utils/notificationUtils.ts'

import * as types from './constants'

export const updateCursor = (cursor: string) => (dispatch: Dispatch) => {
    return dispatch({
        type: types.UPDATE_CURSOR,
        cursor,
    })
}

export function createJob(
    ids: List<*>,
    jobType: string,
    jobPartialParams: Object
): thunkActionType {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        const requestPayload = {
            type: jobType,
            params: Object.assign(
                {},
                {ticket_ids: ids.toJS()},
                jobPartialParams
            ),
        }

        // $TsFixMe remove casting on migration
        const notification: any = dispatch(
            notify({
                status: 'loading',
                dismissAfter: 0,
                closeOnNext: true,
                message: buildJobMessage(
                    jobType,
                    false,
                    ids.size === 1 ? 'ticket' : 'tickets',
                    jobPartialParams,
                    ids.size
                ),
            })
        )

        return axios
            .post('/api/jobs/', requestPayload)
            .then((json = {}) => json.data)
            .then(() => {
                notification.status = 'success'
                return dispatch(updateNotification(notification))
            })
            .catch((error) => {
                notification.status = 'error'
                notification.message =
                    'Failed to apply action on tickets. Please try again.'
                dispatch(updateNotification(notification))
                throw error
            })
    }
}
