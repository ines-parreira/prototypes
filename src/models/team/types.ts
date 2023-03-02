import {EmojiData} from 'emoji-mart'

import {UserRole} from 'config/types/user'
import {ApiPaginationParams, OrderParams} from 'models/api/types'

export type Member = {
    id: number
    name: string
    email: string
    meta: {
        last_phone_call_ended_at?: string
        profile_picture_url?: string
        sso?: string
        name_set_via?: string
        location_info?: {
            calling_code?: string
            city?: string
            country_code?: string
            country_name?: string
            currency?: {code?: string}
            ip?: string
            languages?: {name?: string}[]
            region?: string
            region_code?: string
            time_zone?: {
                abbr?: string
                name?: string
                offset?: string
            }
        }
    } | null
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
