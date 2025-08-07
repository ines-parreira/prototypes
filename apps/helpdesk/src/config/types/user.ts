import { DateFormatType, TimeFormatType } from 'constants/datetime'
import { SoundValue } from 'services/NotificationSounds'

export enum UserRole {
    ObserverAgent = 'observer-agent',
    LiteAgent = 'lite-agent',
    BasicAgent = 'basic-agent',
    Agent = 'agent',
    Admin = 'admin',
    Bot = 'bot',
    GorgiasAgent = 'internal-agent',
}

export type UserDraft = {
    id?: Maybe<number>
    email?: string
    name: string
    role?: { name: UserRole }
}

export type User = UserDraft & {
    role: { name: UserRole }
    email: string
    active: boolean
    bio: Maybe<string>
    country: string | null
    language: string | null
    created_datetime: string
    deactivated_datetime: Maybe<string>
    external_id: string
    firstname: string
    id: number
    lastname: string
    meta: {
        last_phone_call_ended_at?: string
        profile_picture_url?: string | null
        sso?: string
        name_set_via?: string
        location_info?: {
            calling_code?: string
            city?: string
            country_code?: string
            country_name?: string
            currency?: { code?: string }
            ip?: string
            languages?: { name?: string }[]
            region?: string
            region_code?: string
            time_zone?: {
                abbr?: string
                name?: string
                offset?: string
            }
        }
    } | null
    updated_datetime: string
    settings: UserSetting[]
    timezone: string | null
    has_2fa_enabled: boolean
    availability_status?: AvailabilityStatus<AvailabilityStatusChannel.Phone>
    client_id: string | null
}

export enum AvailabilityStatusChannel {
    Phone = 'phone',
}

export enum AvailabilityStatusTag {
    Online = 'online',
    Offline = 'offline',
    Busy = 'busy',
}

export enum AvailabilityStatusDetailCode {
    NotConnected = 1,
    AvailabilitySettingTurnedOff = 2,
    PhoneRinging = 3,
    InPhoneCall = 4,
}

export type AvailabilityStatus<Channel extends AvailabilityStatusChannel> = {
    status: AvailabilityStatusTag
    status_detail_code: AvailabilityStatusDetailCode | null
    channel: Channel
}

export enum PhoneAvailabilityStatus {
    Unavailable = 'Unavailable',
    Available = 'Available',
    InPhoneCall = 'In a call',
    Ringing = 'Ringing',
}

export type EditableUserProfile = {
    bio: string
    email: string
    language: string
    name: string
    timezone: string
    meta?: {
        [key: string]: any
        profile_picture_url?: string | null
    }
}

export enum UserSettingType {
    Preferences = 'preferences',
    ViewsOrdering = 'views-ordering',
    CutomerViews = 'customer-views',
    NotificationPreferences = 'notification-preferences',
}

export type UserSetting =
    | {
          id: number
          type: UserSettingType.Preferences
          data: UserPreferences
      }
    | {
          id: number
          type: UserSettingType.ViewsOrdering
          data: UserViewsOrderingSettingData
      }
    | {
          id: number
          type: UserSettingType.NotificationPreferences
          data: UserNotificationPreferencesData
      }

export type UserPreferences = {
    available: boolean
    show_macros: boolean
    hide_tips?: boolean
    forward_calls?: boolean
    forwarding_phone_number?: string
    forward_when_offline?: boolean
    macros_default_to_search_popover?: boolean
    prefill_best_macro?: boolean
    date_format?: DateFormatType
    time_format?: TimeFormatType
}

export type UserTicketSettings = {
    [key: number]: {
        hide: boolean
        display_order: number
    }
}

export type UserViewsOrderingSettingData = {
    views: Record<string, { display_order: number }>
    view_sections: Record<string, { display_order: number }>
}

export type UserNotificationPreferencesData = {
    notification_sound: {
        enabled: boolean
        sound: SoundValue
        volume: number
    }
    events?: {
        [event: string]: {
            sound: '' | SoundValue
        }
    }
}

export type AgentWithStatus = {
    id: number
    status?: string
    name: string
    meta: { profile_picture_url?: string | null }
}
