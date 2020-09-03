import {Map} from 'immutable'

import {Emoji} from '../../types'

export type TeamUser = {
    id: number
    name: string
    email: string
    meta: Record<string, unknown>
}

type TeamDecoration = {
    emoji?: Emoji
}

export type Team = {
    created_datetime: string
    decoration: TeamDecoration
    description: string
    id: number
    members: TeamUser[]
    name: string
    uri: string
}

export type MemberAddedTeam = {
    created_datetime: string
    id: number
    name: string
    timezone: string
    updated_datetime: string
}

export type TeamsState = Map<any, any>
