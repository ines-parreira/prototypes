//@flow
import {MAPPED_USER_ROLE} from '../user.ts'

export type AgentRoleMeta = {
    description: string,
    label: string,
}

export type MetaByAgentRole = {
    [key: string]: AgentRoleMeta,
}

export type UserRole = $Keys<typeof MAPPED_USER_ROLE>

export type UserDraft = {
    id?: ?number,
    email: string,
    name: string,
    roles: {name: UserRole}[],
}

export type User = UserDraft & {
    active: boolean,
    bio: ?string,
    created_datetime: string,
    data: any,
    deactivated_datetime: string,
    external_id: string,
    firstname: string,
    id: number,
    lastname: string,
    meta: MetaByAgentRole,
    updated_datetime: string,
    roles: {id: number, name: UserRole}[],
    settings: UserSetting[],
}

export type EditableUserProfile = {
    bio: string,
    email: string,
    language: string,
    name: string,
    timezone: string,
}

export type UserSettingType = 'preferences' | 'ticket-views' | 'view-sections'

export type UserSetting = {
    id: number,
    type: UserSettingType,
    data: UserPreferences,
}

export type UserPreferences =
    | {
          available: boolean,
          show_macros: boolean,
      }
    | {
          [key: number]: {
              hide?: boolean,
              display_order: number,
          },
      }
