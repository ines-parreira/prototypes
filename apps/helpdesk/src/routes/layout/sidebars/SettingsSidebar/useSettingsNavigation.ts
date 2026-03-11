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
        id: string
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
                id: 'users',
                to: 'users',
                text: 'Users',
                requiredRole: UserRoleEnum.Admin,
            },
            {
                id: 'teams',
                to: 'teams',
                text: 'Teams',
                requiredRole: UserRoleEnum.Admin,
            },
        ]

        if (isAgentUnavailabilityEnabled) {
            accountItems.push({
                id: 'agent-statuses',
                to: 'agent-statuses',
                text: 'Agent unavailability',
                requiredRole: UserRoleEnum.Admin,
            })
        }

        accountItems.push(
            {
                id: 'access',
                to: 'access',
                text: 'Access management',
                requiredRole: UserRoleEnum.Admin,
            },
            {
                id: 'billing',
                to: 'billing',
                text: 'Billing & usage',
                requiredRole: UserRoleEnum.Admin,
                onClick: () =>
                    logEvent(
                        SegmentEvent.BillingAndUsageNavigationSideNavClicked,
                    ),
            },
            {
                id: 'http-integration',
                to: `integrations/${IntegrationType.Http}`,
                text: 'HTTP integration',
                requiredRole: UserRoleEnum.Admin,
                exact: true,
            },
            {
                id: 'api',
                to: 'api',
                text: 'REST API',
                requiredRole: UserRoleEnum.Admin,
            },
            {
                id: 'audit',
                to: 'audit',
                text: 'Audit logs',
                requiredRole: UserRoleEnum.Admin,
            },
        )

        if (isHistoricalImportsEnabled) {
            accountItems.push({
                id: 'historical-imports',
                to: 'historical-imports',
                text: 'Imports',
                requiredRole: UserRoleEnum.Admin,
            })
        } else {
            accountItems.push(
                {
                    id: 'import-email',
                    to: 'import-email',
                    text: 'Email Import',
                    requiredRole: UserRoleEnum.Admin,
                },
                {
                    id: 'import-zendesk',
                    to: 'import-zendesk',
                    text: 'Zendesk import',
                    requiredRole: UserRoleEnum.Admin,
                },
            )
        }

        accountItems.push({
            id: 'password-2fa',
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
                        id: 'installed-apps',
                        to: 'integrations/mine',
                        text: 'Installed apps',
                        requiredRole: UserRoleEnum.Admin,
                        exact: true,
                    },
                    {
                        id: 'app-store',
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
                        id: 'store',
                        to: 'store-management',
                        text: 'Store',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        id: 'business-hours',
                        to: 'business-hours',
                        text: 'Business hours',
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
                        id: 'help-center',
                        to: 'help-center',
                        text: 'Help Center',
                    },
                    {
                        id: 'phone-numbers',
                        to: 'phone-numbers',
                        text: 'Phone numbers',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        id: 'email',
                        to: `channels/${IntegrationType.Email}`,
                        text: 'Email',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        id: 'voice',
                        to: `channels/${IntegrationType.Phone}`,
                        text: 'Voice',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        id: 'sms',
                        to: `channels/${IntegrationType.Sms}`,
                        text: 'SMS',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        id: 'chat',
                        to: `channels/${IntegrationType.GorgiasChat}`,
                        text: 'Chat',
                        requiredRole: UserRoleEnum.Admin,
                    },
                    {
                        id: 'contact-form',
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
