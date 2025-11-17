import type { EmojiData } from 'emoji-mart'

import type { User, UserRole } from 'config/types/user'
import type { ApiPaginationParams, OrderParams } from 'models/api/types'

export type Member = {
    id: number
    name: string
    email: string
    meta: User['meta']
    role?: {
        id?: number
        name: UserRole
    }
}

export type TeamDecoration = {
    color?: string
    emoji?: EmojiData
}

export type TeamDraft = {
    name: string
    description?: string | null
    decoration?: TeamDecoration
    members: Pick<Member, 'id'>[]
}

export type Team = Omit<TeamDraft, 'members'> & {
    created_datetime: string
    deleted_datetime?: string
    id: number
    uri: string
    members: Member[]
}

export enum TeamSortableProperties {
    CreatedDatetime = 'created_datetime',
    Name = 'name',
}

export type FetchTeamsOptions = ApiPaginationParams &
    OrderParams<TeamSortableProperties>

export enum TeamMembersSortableProperties {
    CreatedDatetime = 'created_datetime',
    Name = 'name',
}

export type FetchTeamMembersOptions = ApiPaginationParams &
    OrderParams<TeamMembersSortableProperties> & {
        id: number
        search?: string
    }

export type MemberAddedTeam = {
    created_datetime: string
    id: number
    name: string
    timezone: string
    updated_datetime: string
}
