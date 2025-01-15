import {Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {ReactNode, useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import Badge, {ColorType} from 'pages/common/components/Badge'

import {getHasAutomate} from 'state/billing/selectors'

import {hasRole} from 'utils'

import mainNavigationCSS from '../components/MainNavigation.less'

export enum MenuItemName {
    Automate = 'automate',
    AiAgent = 'ai-agent',
    Convert = 'convert',
    Customers = 'customers',
    Settings = 'settings',
    Statistics = 'statistics',
    Tickets = 'tickets',
}

export type MenuItem = {
    name: MenuItemName
    url: string
    label: string
    className?: string
    icon: string
    addon?: ReactNode
    segmentProp: {link: string}
    requiredRole?: UserRole
}

export const useMainNavigationItems = (
    currentUser: Map<any, any>
): MenuItem[] => {
    const flags = useFlags()
    const hasAutomate = useAppSelector(getHasAutomate)

    return useMemo(() => {
        const menuItems: Array<MenuItem & {onlyIf?: boolean}> = [
            {
                url: '/app/tickets',
                label: 'Tickets',
                name: MenuItemName.Tickets,
                icon: 'question_answer',
                segmentProp: {link: 'tickets'},
            },
            {
                url: '/app/automation',
                label: 'Automate',
                icon: 'bolt',
                name: MenuItemName.Automate,
                segmentProp: {link: 'automation'},
                requiredRole: UserRole.Agent,
            },
            {
                url: '/app/ai-agent',
                label: 'AI Agent',
                icon: 'auto_awesome',
                name: MenuItemName.AiAgent,
                addon: (
                    <Badge
                        className={mainNavigationCSS.badge}
                        type={ColorType.Magenta}
                    >
                        NEW
                    </Badge>
                ),
                segmentProp: {link: 'ai-agent'},
                requiredRole: UserRole.Agent,
                onlyIf: !!(
                    flags[FeatureFlagKey.ConvAiStandaloneMenu] &&
                    (hasAutomate ||
                        flags[FeatureFlagKey.AIAgentPreviewModeAllowed])
                ),
            },
            {
                url: '/app/convert',
                label: 'Convert',
                icon: 'monetization_on',
                name: MenuItemName.Convert,
                segmentProp: {link: 'convert'},
                requiredRole: UserRole.Admin,
            },
            {
                url: '/app/customers',
                label: 'Customers',
                icon: 'people',
                name: MenuItemName.Customers,
                segmentProp: {link: 'customers'},
            },
            {
                url: '/app/stats',
                label: 'Statistics',
                className: 'd-none d-md-block',
                icon: 'bar_chart',
                name: MenuItemName.Statistics,
                segmentProp: {link: 'statistics'},
            },
            {
                url: '/app/settings',
                label: 'Settings',
                icon: 'settings',
                name: MenuItemName.Settings,
                segmentProp: {link: 'settings'},
            },
        ]

        return menuItems
            .filter(
                (item) =>
                    !item.requiredRole ||
                    hasRole(currentUser, item.requiredRole)
            )
            .filter((item) => item.onlyIf !== false)
    }, [currentUser, flags, hasAutomate])
}
