import {
    ListUsersRelationshipsItem,
    ListUsersRolesItem,
} from '@gorgias/api-queries'

import {ApiPaginationParams, OrderParams} from 'models/api/types'

export enum AgentSortableProperties {
    CreatedDatetimeAsc = 'created_datetime:asc',
    CreatedDatetimeDesc = 'created_datetime:desc',
    NameAsc = 'name:asc',
    NameDesc = 'name:desc',
}

export enum AgentsRelationshipsParam {
    AvailabilityStatus = 'availability_status',
}

export type FetchAgentsOptions = Omit<
    ApiPaginationParams,
    'orderBy' | 'orderDir'
> &
    OrderParams<AgentSortableProperties> & {
        id?: number
        email?: string
        externalId?: string
        roles?: ListUsersRolesItem[]
        relationships?: ListUsersRelationshipsItem[]
    }

export const DateFormattingSetting = {
    en_GB: {
        label: 'Day/Month/Year',
        caption: `Example: 1 Jan, ${new Date().getFullYear()}`,
    },
    en_US: {
        label: 'Month/Day/Year',
        caption: `Example: Jan 1, ${new Date().getFullYear()}`,
    },
}

export const TimeFormattingSetting = ['24-hour', 'AM/PM']
