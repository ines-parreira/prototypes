import {List} from 'immutable'
import {notify as updateNotification} from 'reapop'
import {UpsertNotificationAction} from 'reapop/dist/reducers/notifications/actions'

import client from '../../models/api/resources'
import {notify} from '../notifications/actions'
import {StoreDispatch} from '../types'
import {buildJobMessage} from '../../utils/notificationUtils'
import {NotificationStatus} from '../notifications/types'
import {JobType} from '../../models/job/types'

import * as types from './constants'

export const updateCursor = (cursor: string) => (dispatch: StoreDispatch) => {
    return dispatch({
        type: types.UPDATE_CURSOR,
        cursor,
    })
}

export function createJob(
    ids: List<any>,
    jobType: JobType,
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
        ) as unknown as UpsertNotificationAction

        return client
            .post('/api/jobs/', requestPayload)
            .then(() => {
                notification.payload.status = NotificationStatus.Success
                return dispatch(updateNotification(notification.payload))
            })
            .catch((error) => {
                notification.payload.status = NotificationStatus.Error
                notification.payload.message =
                    'Failed to apply action on tickets. Please try again.'
                dispatch(updateNotification(notification.payload))
                throw error
            })
    }
}
