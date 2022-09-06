export type AgentRoleMeta = {
    description: string
    label: string
}

export type MetaByAgentRole = {
    [key: string]: AgentRoleMeta
}

export enum UserRole {
    ObserverAgent = 'observer-agent',
    LiteAgent = 'lite-agent',
    BasicAgent = 'basic-agent',
    Agent = 'agent',
    Admin = 'admin',
}

export type UserDraft = {
    id?: Maybe<number>
    email: string
    name: string
    role: {name: UserRole}
}

export type User = UserDraft & {
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
    meta: MetaByAgentRole
    updated_datetime: string
    settings: UserSetting[]
    timezone: string | null
    has_2fa_enabled: boolean
}

export type EditableUserProfile = {
    bio: string
    email: string
    language: string
    name: string
    timezone: string
    meta?: {profile_picture_url?: string}
}

export enum UserSettingType {
    Preferences = 'preferences',
    TicketViews = 'ticket-views',
    ViewsOrdering = 'views-ordering',
}

export type UserSetting =
    | {
          id: number
          type: UserSettingType.Preferences
          data: UserPreferences
      }
    | {
          id: number
          type: UserSettingType.TicketViews
          data: UserTicketSettings
      }
    | {
          id: number
          type: UserSettingType.ViewsOrdering
          data: UserViewsOrderingSettingData
      }

export type UserPreferences = {
    available: boolean
    show_macros: boolean
    hide_tips?: boolean
    forward_calls?: boolean
    forwarding_phone_number?: string
    macros_default_to_search_popover?: boolean
    prefill_best_macro?: boolean
}

export type UserTicketSettings = {
    [key: number]: {
        hide: boolean
        display_order: number
    }
}

export type UserViewsOrderingSettingData = {
    views: Record<string, {display_order: number}>
    view_sections: Record<string, {display_order: number}>
}
