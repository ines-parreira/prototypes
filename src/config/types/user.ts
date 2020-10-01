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
    roles: {name: UserRole}[]
}

export type User = UserDraft & {
    active: boolean
    bio: Maybe<string>
    created_datetime: string
    data: Maybe<unknown>
    deactivated_datetime: Maybe<string>
    external_id: string
    firstname: string
    id: number
    lastname: string
    meta: MetaByAgentRole
    updated_datetime: string
    roles: {id: number; name: UserRole}[]
    settings: UserSetting[]
}

export type EditableUserProfile = {
    bio: string
    email: string
    language: string
    name: string
    timezone: string
}

enum UserSettingType {
    Preferences = 'preferences',
}

export type UserSetting = {
    id: number
    type: UserSettingType.Preferences
    data: UserPreferences
}

export type UserPreferences = {
    available: boolean
    show_macros: boolean
}
