import {UserRole} from 'config/types/user'
import {ApiCursorPaginationParams, OrderParams} from 'models/api/types'

export enum AgentSortableProperties {
    CreatedDatetimeAsc = 'created_datetime:asc',
    CreatedDatetimeDesc = 'created_datetime:desc',
    NameAsc = 'name:asc',
    NameDesc = 'name:desc',
}

export type FetchAgentsOptions = Omit<
    ApiCursorPaginationParams,
    'orderBy' | 'orderDir'
> &
    OrderParams<AgentSortableProperties> & {
        externalId?: string
        roles?: UserRole[]
    }
