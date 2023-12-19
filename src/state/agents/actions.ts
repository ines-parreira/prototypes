import {User} from 'config/types/user'
import {USER_ROLES} from 'config/user'
import {fetchAgents} from 'models/agents/resources'
import {FetchAgentsOptions} from 'models/agents/types'
import client from 'models/api/resources'
import GorgiasApi from 'services/gorgiasApi'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {StoreDispatch} from 'state/types'

import * as constants from './constants'

export function fetchUsers(options: FetchAgentsOptions = {}) {
    return async (
        dispatch: StoreDispatch
    ): Promise<ReturnType<StoreDispatch>> => {
        const {cursor, externalId, limit, orderBy, roles = USER_ROLES} = options
        dispatch({
            type: constants.FETCH_USER_LIST_START,
        })

        const client = new GorgiasApi()
        const generator = client.cursorPaginate<User, FetchAgentsOptions>(
            fetchAgents,
            {
                cursor,
                externalId,
                limit,
                orderBy,
                roles,
            }
        )

        let result: User[] = []
        try {
            for await (const page of generator) {
                result = result.concat(page)
            }
            return dispatch({
                type: constants.FETCH_USER_LIST_SUCCESS,
                resp: result,
                roles,
            })
        } catch (error) {
            return dispatch({
                type: constants.FETCH_USER_LIST_ERROR,
                error,
                reason: 'Failed to fetch users',
            })
        }
    }
}

export const deleteAgent =
    (id: number) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.delete(`/api/users/${id}/`).then(() => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Team member deleted',
                })
            )

            return dispatch({
                type: constants.DELETE_AGENT_SUCCESS,
                id,
            })
        })
    }

export const setAgentsLocations = (locations: Record<string, unknown>) => ({
    type: constants.SET_AGENTS_LOCATIONS,
    data: locations,
})

export const setAgentsTypingStatuses = (
    locations: Record<string, unknown>
) => ({
    type: constants.SET_AGENTS_TYPING_STATUSES,
    data: locations,
})
