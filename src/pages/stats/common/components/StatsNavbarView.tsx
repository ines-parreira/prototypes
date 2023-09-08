import React, {useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import cssNavbar from 'assets/css/navbar.less'
import {FeatureFlagKey} from 'config/featureFlags'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import AutomationNavbarAddOnPaywallNavbarLink from 'pages/automation/common/components/AutomationNavbarAddOnPaywallNavbarLink'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import {useIsRevenueBetaTester} from 'pages/common/hooks/useIsRevenueBetaTester'
import {
    AUTOMATION_ADD_ON_PATH,
    AUTOMATION_ADD_ON_TITLE,
} from 'pages/stats/self-service/constants'

const COMMON_NAV_LINK_PROPS: Partial<NavbarLinkProps> = {
    exact: true,
}

export default function StatsNavbarView() {
    const hasAnalyticsNewAgentPerformance: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewAgentPerformance]

    const hasAnalyticsTicketInsights: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsTicketInsights]

    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModal,
    ] = useState(false)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const isRevenueSubscriber = useIsRevenueBetaTester()

    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className={cssNavbar.menu}>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/live-overview"
                    >
                        Overview
                    </NavbarLink>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/live-agents"
                    >
                        Agents
                    </NavbarLink>
                </div>
            </NavbarBlock>
            <NavbarBlock icon="insights" title="Support Performance">
                <div className={cssNavbar.menu}>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/support-performance-overview"
                    >
                        Overview
                    </NavbarLink>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/support-performance-agents"
                    >
                        Agents
                        {hasAnalyticsNewAgentPerformance && (
                            <Badge type={ColorType.Blue}>new</Badge>
                        )}
                    </NavbarLink>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/busiest-times-of-days"
                    >
                        Busiest times of days
                    </NavbarLink>
                    {hasAnalyticsTicketInsights ? (
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/ticket-insights"
                        >
                            Ticket insights
                        </NavbarLink>
                    ) : (
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/ticket-fields"
                        >
                            Ticket Fields
                        </NavbarLink>
                    )}
                    <NavbarLink {...COMMON_NAV_LINK_PROPS} to="/app/stats/tags">
                        Tags
                    </NavbarLink>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/channels"
                    >
                        Channels
                    </NavbarLink>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/satisfaction"
                    >
                        Satisfaction
                    </NavbarLink>
                    {!isRevenueSubscriber && (
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/revenue"
                        >
                            Revenue
                        </NavbarLink>
                    )}
                </div>
            </NavbarBlock>
            <NavbarBlock icon="bolt" title="Automation">
                <div className={cssNavbar.menu}>
                    {
                        // TMP: This link will come back when the page will be reworked
                        // <NavbarLink
                        //     {...COMMON_NAV_LINK_PROPS}
                        //     to="/app/stats/automation"
                        // >
                        //     Overview
                        // </NavbarLink>
                    }
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/macros"
                    >
                        Macros
                    </NavbarLink>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/intents"
                    >
                        Intents
                    </NavbarLink>
                    {!hasAutomationAddOn ? (
                        <>
                            <AutomationNavbarAddOnPaywallNavbarLink
                                to={AUTOMATION_ADD_ON_PATH}
                                exact
                                onSubscribeToAutomationAddOnClick={() => {
                                    setIsAutomationSubscriptionModal(true)
                                }}
                            >
                                {AUTOMATION_ADD_ON_TITLE}
                            </AutomationNavbarAddOnPaywallNavbarLink>
                            <AutomationSubscriptionModal
                                confirmLabel="Subscribe"
                                isOpen={isAutomationSubscriptionModalOpen}
                                onClose={() =>
                                    setIsAutomationSubscriptionModal(false)
                                }
                            />
                        </>
                    ) : (
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={AUTOMATION_ADD_ON_PATH}
                        >
                            {AUTOMATION_ADD_ON_TITLE}
                        </NavbarLink>
                    )}
                </div>
            </NavbarBlock>
            {isRevenueSubscriber && (
                <NavbarBlock icon="attach_money" title="Convert">
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/revenue"
                    >
                        Overview
                    </NavbarLink>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/revenue/campaigns"
                    >
                        Campaigns
                        <Badge
                            type={ColorType.Blue}
                            className={cssNavbar.badge}
                        >
                            BETA
                        </Badge>
                    </NavbarLink>
                </NavbarBlock>
            )}
        </>
    )
}
