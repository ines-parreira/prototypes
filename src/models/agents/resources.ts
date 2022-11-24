import qs from 'qs'

import {User} from 'config/types/user'
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
