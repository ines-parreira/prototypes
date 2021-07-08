import {List} from 'immutable'
import axios from 'axios'
import {updateNotification} from 'reapop'
import {AnyAction} from 'redux'

import {notify} from '../notifications/actions'
import {StoreDispatch} from '../types'
import {buildJobMessage} from '../../utils/notificationUtils'
import {NotificationStatus} from '../notifications/types'

import * as types from './constants.js'

export const updateCursor = (cursor: string) => (dispatch: StoreDispatch) => {
    return dispatch({
        type: types.UPDATE_CURSOR,
        cursor,
    })
}

export function createJob(
    ids: List<any>,
    jobType: string,
    jobPartialParams: Record<string, unknown>
) {
    return (dispatch: StoreDispatch) => {
        const requestPayload = {
            type: jobType,
            params: Object.assign(
                {},
                {ticket_ids: ids.toJS()},
                jobPartialParams
            ),
        }

        const notification = dispatch(
            notify({
                status: NotificationStatus.Loading,
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
        ) as Promise<Notification> & {
            status: NotificationStatus
            message: string
        }

        return axios
            .post('/api/jobs/', requestPayload)
            .then(() => {
                notification.status = NotificationStatus.Success
                return dispatch(
                    (updateNotification as (
                        notification: Promise<Notification> & {
                            status: NotificationStatus
                            message: string
                        }
                    ) => AnyAction)(notification)
                )
            })
            .catch((error) => {
                notification.status = NotificationStatus.Error
                notification.message =
                    'Failed to apply action on tickets. Please try again.'
                dispatch(
                    (updateNotification as (
                        notification: Promise<Notification> & {
                            status: NotificationStatus
                            message: string
                        }
                    ) => AnyAction)(notification)
                )
                throw error
            })
    }
}
