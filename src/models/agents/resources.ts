import qs from 'qs'

import {User, UserDraft} from 'config/types/user'
import {USER_ROLES} from 'config/user'
import {FetchAgentsOptions} from 'models/agents/types'
import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'

export const fetchAgents = async (options: FetchAgentsOptions = {}) => {
    const parameters: Record<string, unknown> = deepMapKeysToSnakeCase(options)

    parameters.roles = parameters.roles || USER_ROLES

    return await client.get<ApiListResponseCursorPagination<User[]>>(
        '/api/users/',
        {
            params: {limit: 30, ...parameters},
            paramsSerializer: (params) => {
                return qs.stringify(params, {arrayFormat: 'repeat'})
            },
        }
    )
}

export const fetchAgent = async (id: number) => {
    const res = await client.get<User>(`/api/users/${id}`)
    return res.data
}

export async function createAgent(agent: UserDraft) {
    const response = await client.post<User>('/api/users', agent)
    return response
}

export async function updateAgent({id, agent}: {id: number; agent: UserDraft}) {
    const response = await client.put<User>(`/api/users/${id}`, agent)
    return response
}

export async function deleteAgent(id: number) {
    const response = await client.delete<undefined>(`/api/users/${id}`)
    return response
}

export async function inviteAgent(id: number) {
    const response = await client.post<undefined>(`/api/users/${id}/invite`)
    return response
}
