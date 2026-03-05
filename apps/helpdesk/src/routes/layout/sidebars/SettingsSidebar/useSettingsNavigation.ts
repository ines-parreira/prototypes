import { useMemo } from 'react'

import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import type { UserRole } from '@repo/utils'
import { UserRole as UserRoleEnum } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'
import {
    SettingsSection,
    settingsSections,
} from 'routes/layout/products/settings'

export type SettingsNavbarSection = {
    id: string
    label: string
    icon?: IconName
    requiredRole?: UserRole.Admin | UserRole.Agent
    items: {
        key: string
        to: string
        text: string
        requiredRole?: UserRole.Admin | UserRole.Agent
        exact?: boolean
        onClick?: () => void
    }[]
}

export function useSettingsNavigation() {
    const isAgentUnavailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    const isHistoricalImportsEnabled = useFlag(FeatureFlagKey.HistoricalImports)

    const sections = useMemo<SettingsNavbarSection[]>(() => {
        const accountItems: SettingsNavbarSection['items'] = [
            {
                key: 'users',
                to: 'users',
                text: 'Users',
                requiredRole: UserRoleEnum.Admin,
            },
            {
                key: 'teams',
                to: 'teams',
                text: 'Teams',
                requiredRole: UserRoleEnum.Admin,
            },
        ]

        if (isAgentUnavailabilityEnabled) {
            accountItems.push({
                key: 'agent-statuses',
                to: 'agent-statuses',
                text: 'Agent unavailability',
                requiredRole: UserRoleEnum.Admin,
            })
        }

        accountItems.push(
            {
                key: 'access',
                to: 'access',
                text: 'Access management',
                requiredRole: UserRoleEnum.Admin,
            },
            {
                key: 'billing',
                to: 'billing',
                text: 'Billing & usage',
                requiredRole: UserRoleEnum.Admin,
                onClick: () =>
                    logEvent(
                        SegmentEvent.BillingAndUsageNavigationSideNavClicked,
                    ),
            },
            {
                key: 'http-integration',
                to: `integrations/${IntegrationType.Http}`,
                text: 'HTTP integration',
                requiredRole: UserRoleEnum.Admin,
                exact: true,
            },
            {
                key: 'api',
                to: 'api',
                text: 'REST API',
                requiredRole: UserRoleEnum.Admin,
            },
            {
                key: 'audit',
                to: 'audit',
                text: 'Audit logs',
                requiredRole: UserRoleEnum.Admin,
            },
        )

        if (isHistoricalImportsEnabled) {
            accountItems.push({
                key: 'historical-imports',
                to: 'historical-imports',
                text: 'Imports',
                requiredRole: UserRoleEnum.Admin,
            })
        } else {
            accountItems.push(
                {
                    key: 'import-email',
                    to: 'import-email',
                    text: 'Email Import',
                    requiredRole: UserRoleEnum.Admin,
                },
                {
                    key: 'import-zendesk',
                    to: 'import-zendesk',
                    text: 'Zendesk import',
                    requiredRole: UserRoleEnum.Admin,
                },
            )
        }

        accountItems.push({
            key: 'password-2fa',
            to: 'password-2fa',
            text: 'Password & 2FA',
        })

        return [
            {
                id: settingsSections[SettingsSection.Apps].id,
                label: settingsSections[SettingsSection.Apps].label,
                icon: settingsSections[SettingsSection.Apps].icon,
                requiredRole:
                    settingsSections[SettingsSection.Apps].requiredRole,
                items: [
                    {
                        key: 'installed-apps',
                        to: 'integrations/mine',
                        text: 'Installed apps',
                        requiredRole: UserRoleEnum.Admin,
                        exact: true,
                    },
                    {
                        key: 'app-store',
                        to: 'integrations',
                        text: 'App store',
                        requiredRole: UserRoleEnum.Admin,
                        exact: true,
                    },
                ],
            },
            {
                id: settingsSections[SettingsSection.Workspace].id,
                label: settingsSections[SettingsSection.Workspace].label,
                icon: settingsSections[SettingsSection.Workspace].icon,
                requiredRole:
                    settingsSections[SettingsSection.Workspace].requiredRole,
                items: [
                    {
                        key: 'store',
                        to: 'store-management',
                        text: 'Store',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        key: 'business-hours',
                        to: 'business-hours',
                        text: 'Business hours',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        key: 'default-views',
                        to: 'sidebar',
                        text: 'Default views',
                        requiredRole: UserRoleEnum.Admin,
                    },
                ],
            },
            {
                id: settingsSections[SettingsSection.Channels].id,
                label: settingsSections[SettingsSection.Channels].label,
                icon: settingsSections[SettingsSection.Channels].icon,
                items: [
                    {
                        key: 'help-center',
                        to: 'help-center',
                        text: 'Help Center',
                    },
                    {
                        key: 'phone-numbers',
                        to: 'phone-numbers',
                        text: 'Phone numbers',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        key: 'email',
                        to: `channels/${IntegrationType.Email}`,
                        text: 'Email',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        key: 'voice',
                        to: `channels/${IntegrationType.Phone}`,
                        text: 'Voice',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        key: 'sms',
                        to: `channels/${IntegrationType.Sms}`,
                        text: 'SMS',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        key: 'chat',
                        to: `channels/${IntegrationType.GorgiasChat}`,
                        text: 'Chat',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        key: 'contact-form',
                        to: 'contact-form',
                        text: 'Contact form',
                        requiredRole: UserRoleEnum.Admin,
                    },
                ],
            },
            {
                id: settingsSections[SettingsSection.Account].id,
                label: settingsSections[SettingsSection.Account].label,
                icon: settingsSections[SettingsSection.Account].icon,
                requiredRole:
                    settingsSections[SettingsSection.Account].requiredRole,
                items: accountItems,
            },
        ]
    }, [isAgentUnavailabilityEnabled, isHistoricalImportsEnabled])

    return { sections }
}
