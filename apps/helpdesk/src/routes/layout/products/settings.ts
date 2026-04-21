import { UserRole } from '@repo/permissions'

import type { IconName } from '@gorgias/axiom'

export const SETTINGS_DEFAULT_PATH = '/app/settings'

export enum SettingsSection {
    Apps = 'apps',
    Workspace = 'workspace',
    Channels = 'channels',
    Account = 'account',
}

export type SettingsSectionConfig = {
    id: SettingsSection
    label: string
    icon: IconName
    requiredRole?: UserRole.Admin | UserRole.Agent
}

export const settingsSections: Record<SettingsSection, SettingsSectionConfig> =
    {
        [SettingsSection.Apps]: {
            id: SettingsSection.Apps,
            label: 'Apps',
            icon: 'menu-more-grid',
            requiredRole: UserRole.Admin,
        },
        [SettingsSection.Workspace]: {
            id: SettingsSection.Workspace,
            label: 'Workspace',
            icon: 'nav-building-alt-4',
            requiredRole: UserRole.Admin,
        },
        [SettingsSection.Channels]: {
            id: SettingsSection.Channels,
            label: 'Channels',
            icon: 'comm-chat-conversation',
        },
        [SettingsSection.Account]: {
            id: SettingsSection.Account,
            label: 'Account',
            icon: 'users',
            requiredRole: UserRole.Admin,
        },
    }
