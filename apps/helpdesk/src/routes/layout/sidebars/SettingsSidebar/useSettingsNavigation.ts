import { useMemo } from 'react'

import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { filterUserByRole, UserRole } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-types'

import { IntegrationType } from 'models/integration/types'
import { STANDALONE_AI_HIDDEN_SIDEBAR_ITEMS } from 'providers/standalone-ai/constants'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import {
    SettingsSection,
    settingsSections,
} from 'routes/layout/products/settings'

export type SettingsNavbarSection = {
    id: string
    label: string
    icon: IconName
    requiredRole?: UserRole
    items: {
        id: string
        to: string
        text: string
        requiredRole?: UserRole
        exact?: boolean
        onClick?: () => void
    }[]
}

export function useSettingsNavigation() {
    const isAgentUnavailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    const isHistoricalImportsEnabled = useFlag(FeatureFlagKey.HistoricalImports)
    const { isStandaloneAiAgent } = useStandaloneAiContext()
    const { data: currentUser } = useGetCurrentUser({
        query: {
            select: (data: { data: User }) => data.data,
        },
    })

    const sectionsWithoutRoleFilters = useMemo<SettingsNavbarSection[]>(() => {
        const accountItems: SettingsNavbarSection['items'] = [
            {
                id: 'users',
                to: 'users',
                text: 'Users',
                requiredRole: UserRole.Admin,
            },
            {
                id: 'teams',
                to: 'teams',
                text: 'Teams',
                requiredRole: UserRole.Admin,
            },
        ]

        if (isAgentUnavailabilityEnabled) {
            accountItems.push({
                id: 'agent-statuses',
                to: 'agent-statuses',
                text: 'Agent unavailability',
                requiredRole: UserRole.Admin,
            })
        }

        accountItems.push(
            {
                id: 'access',
                to: 'access',
                text: 'Access management',
                requiredRole: UserRole.Admin,
            },
            {
                id: 'billing',
                to: 'billing',
                text: 'Billing and usage',
                requiredRole: UserRole.Admin,
                onClick: () =>
                    logEvent(
                        SegmentEvent.BillingAndUsageNavigationSideNavClicked,
                    ),
            },
            {
                id: 'http-integration',
                to: `integrations/${IntegrationType.Http}`,
                text: 'HTTP integration',
                requiredRole: UserRole.Admin,
                exact: true,
            },
            {
                id: 'api',
                to: 'api',
                text: 'REST API',
                requiredRole: UserRole.Admin,
            },
            {
                id: 'audit',
                to: 'audit',
                text: 'Audit logs',
                requiredRole: UserRole.Admin,
            },
        )

        if (isHistoricalImportsEnabled) {
            accountItems.push({
                id: 'historical-imports',
                to: 'historical-imports',
                text: 'Imports',
                requiredRole: UserRole.Admin,
            })
        } else {
            accountItems.push(
                {
                    id: 'import-email',
                    to: 'import-email',
                    text: 'Email Import',
                    requiredRole: UserRole.Admin,
                },
                {
                    id: 'import-zendesk',
                    to: 'import-zendesk',
                    text: 'Zendesk import',
                    requiredRole: UserRole.Admin,
                },
            )
        }

        accountItems.push(
            {
                id: 'password-2fa',
                to: 'password-2fa',
                text: currentUser?.has_password ? '2FA' : 'Password & 2FA',
            },
            {
                id: 'notifications',
                to: 'notifications',
                text: 'Notifications',
            },
        )

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
                        requiredRole: UserRole.Admin,
                        exact: true,
                    },
                    {
                        id: 'app-store',
                        to: 'integrations',
                        text: 'App store',
                        requiredRole: UserRole.Admin,
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
                        requiredRole: UserRole.Admin,
                    },
                    {
                        id: 'business-hours',
                        to: 'business-hours',
                        text: 'Business hours',
                        requiredRole: UserRole.Admin,
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
                        requiredRole: UserRole.Admin,
                    },
                    {
                        id: 'email',
                        to: `channels/${IntegrationType.Email}`,
                        text: 'Email',
                        requiredRole: UserRole.Admin,
                    },
                    {
                        id: 'voice',
                        to: `channels/${IntegrationType.Phone}`,
                        text: 'Voice',
                        requiredRole: UserRole.Admin,
                    },
                    {
                        id: 'sms',
                        to: `channels/${IntegrationType.Sms}`,
                        text: 'SMS',
                        requiredRole: UserRole.Admin,
                    },
                    {
                        id: 'chat',
                        to: `channels/${IntegrationType.GorgiasChat}`,
                        text: 'Chat',
                        requiredRole: UserRole.Admin,
                    },
                    {
                        id: 'contact-form',
                        to: 'contact-form',
                        text: 'Contact form',
                        requiredRole: UserRole.Admin,
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
    }, [isAgentUnavailabilityEnabled, isHistoricalImportsEnabled, currentUser])

    const sections = useMemo(() => {
        const roleFiltered = sectionsWithoutRoleFilters
            .filter((section) => filterUserByRole(currentUser, section))
            .map((section) => {
                return {
                    ...section,
                    items: section.items.filter((item) =>
                        filterUserByRole(currentUser, item),
                    ),
                }
            })

        if (!isStandaloneAiAgent) return roleFiltered

        return roleFiltered
            .map((section) => ({
                ...section,
                items: section.items.filter(
                    (item) => !STANDALONE_AI_HIDDEN_SIDEBAR_ITEMS.has(item.id),
                ),
            }))
            .filter((section) => section.items.length > 0)
    }, [sectionsWithoutRoleFilters, currentUser, isStandaloneAiAgent])

    return { sections }
}
