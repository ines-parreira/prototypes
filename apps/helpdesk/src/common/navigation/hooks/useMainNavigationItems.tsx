import type { ReactNode } from 'react'
import React, { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Map } from 'immutable'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import { UserRole } from 'config/types/user'
import { useHasAiAgentMenu } from 'pages/aiAgent/hooks/useHasAiAgentMenu'
import { hasRole } from 'utils'

import { useStandaloneAiAccess } from '../../../hooks/useStandaloneAiAccess'
import {
    BASE_STATS_PATH,
    STANDALONE_AI_AGENT_STATS_PATH,
} from '../../../routes/constants'

import mainNavigationCSS from '../components/MainNavigation.less'

export enum MenuItemName {
    Automate = 'automate',
    AiAgent = 'ai-agent',
    Convert = 'convert',
    Customers = 'customers',
    Settings = 'settings',
    Statistics = 'statistics',
    Tickets = 'tickets',
    VoiceOfCustomer = 'voice-of-customer',
    AiJourney = 'ai-journey',
}

export type MenuItem = {
    name: MenuItemName
    url: string
    label: string
    className?: string
    icon: string
    addon?: ReactNode
    segmentProp: { link: string }
    requiredRole?: UserRole
}

export const useMainNavigationItems = (
    currentUser: Map<any, any>,
): MenuItem[] => {
    const hasAiAgentMenu = useHasAiAgentMenu()
    const isAiJourneyEnabled = useFlag(FeatureFlagKey.AiJourneyEnabled)

    const { isStandaloneAiAgent } = useStandaloneAiAccess()

    return useMemo(() => {
        const menuItems: Array<MenuItem & { onlyIf?: boolean }> = [
            {
                url: '/app/tickets',
                label: 'Tickets',
                name: MenuItemName.Tickets,
                icon: 'question_answer',
                segmentProp: { link: 'tickets' },
            },
            {
                url: '/app/ai-agent',
                label: 'AI Agent',
                icon: 'auto_awesome',
                name: MenuItemName.AiAgent,
                addon: (
                    <Badge className={mainNavigationCSS.badge} type={'magenta'}>
                        NEW
                    </Badge>
                ),
                segmentProp: { link: 'ai-agent' },
                requiredRole: UserRole.Agent,
                onlyIf: hasAiAgentMenu,
            },
            {
                url: '/app/ai-journey',
                label: 'AI Journey',
                icon: 'sms',
                name: MenuItemName.AiJourney,
                segmentProp: { link: 'ai-journey' },
                onlyIf: isAiJourneyEnabled,
            },
            {
                url: '/app/convert',
                label: 'Convert',
                icon: 'monetization_on',
                name: MenuItemName.Convert,
                segmentProp: { link: 'convert' },
                requiredRole: UserRole.Admin,
            },
            {
                url: '/app/customers',
                label: 'Customers',
                icon: 'people',
                name: MenuItemName.Customers,
                segmentProp: { link: 'customers' },
            },
            {
                url: isStandaloneAiAgent
                    ? STANDALONE_AI_AGENT_STATS_PATH
                    : BASE_STATS_PATH,
                label: 'Statistics',
                className: 'd-none d-md-block',
                icon: 'bar_chart',
                name: MenuItemName.Statistics,
                segmentProp: { link: 'statistics' },
            },
            {
                url: '/app/settings',
                label: 'Settings',
                icon: 'settings',
                name: MenuItemName.Settings,
                segmentProp: { link: 'settings' },
            },
        ]

        return menuItems
            .filter(
                (item) =>
                    !item.requiredRole ||
                    hasRole(currentUser, item.requiredRole),
            )
            .filter((item) => item.onlyIf !== false)
    }, [currentUser, hasAiAgentMenu, isAiJourneyEnabled, isStandaloneAiAgent])
}
