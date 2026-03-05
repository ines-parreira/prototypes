import { UserRole } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'

export const SETTINGS_DEFAULT_PATH = '/app/settings'

export enum SettingsSection {
    Apps = 'Apps',
    Workspace = 'Workspace',
    Channels = 'Channels',
    Account = 'Account',
}

export type SettingsSectionConfig = {
    id: string
    label: string
    icon?: IconName
    requiredRole?: UserRole.Admin | UserRole.Agent
}

export const settingsSections: Record<SettingsSection, SettingsSectionConfig> =
    {
        [SettingsSection.Apps]: {
            id: 'apps',
            label: 'Apps',
            icon: 'menu-more-grid',
            requiredRole: UserRole.Admin,
        },
        [SettingsSection.Workspace]: {
            id: 'workspace',
            label: 'Workspace',
            icon: 'nav-building-alt-4',
            requiredRole: UserRole.Agent,
        },
        [SettingsSection.Channels]: {
            id: 'channels',
            label: 'Channels',
            icon: 'comm-chat-conversation',
        },
        [SettingsSection.Account]: {
            id: 'account',
            label: 'Account',
            icon: 'users',
            requiredRole: UserRole.Admin,
        },
    }
