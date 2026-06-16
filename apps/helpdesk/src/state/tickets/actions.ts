import client from '@repo/api-resources'
import { buildJobMessage } from '@repo/utils'
import type { List } from 'immutable'

import { toast } from '@gorgias/axiom'
import type { JobType } from '@gorgias/helpdesk-queries'

import { JOBS_PATH } from 'models/job/resources'

import type { StoreDispatch } from '../types'
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
    jobPartialParams: Record<string, unknown>,
) {
    return (__dispatch: StoreDispatch) => {
        const requestPayload = {
            type: jobType,
            params: Object.assign(
                {},
                { ticket_ids: ids.toJS() },
                jobPartialParams,
            ),
        }

        const startMessage = buildJobMessage(
            jobType,
            false,
            ids.size === 1 ? 'ticket' : 'tickets',
            jobPartialParams,
            ids.size,
        )
        const toastId = toast.info(startMessage, { duration: Infinity })

        return client
            .post(JOBS_PATH, requestPayload)
            .then(() => {
                toast.dismiss(toastId)
                toast.success(startMessage)
            })
            .catch((error) => {
                toast.dismiss(toastId)
                toast.error(
                    'Failed to apply action on tickets. Please try again.',
                )
                throw error
            })
    }
}
