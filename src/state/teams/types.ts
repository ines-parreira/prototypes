import {Map} from 'immutable'
import {EmojiData} from 'emoji-mart'

export type TeamUser = {
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
    }
}

type TeamDecoration = {
    emoji?: EmojiData
}

export type Team = {
    created_datetime: string
    decoration: TeamDecoration
    description?: string | null
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
