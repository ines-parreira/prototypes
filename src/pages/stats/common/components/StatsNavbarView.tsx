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

import css from './StatsNavbarView.less'

const COMMON_NAV_LINK_PROPS: Partial<NavbarLinkProps> = {
    className: css.link,
    exact: true,
}

export default function StatsNavbarView() {
    const hasAnalyticsBeta: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsBetaTesters]
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModal,
    ] = useState(false)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const isRevenueSubscriber = useIsRevenueBetaTester()
    const hasAttributionModel = Boolean(
        useFlags()[FeatureFlagKey.RevenueAttributionModel]
    )

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
                        {hasAnalyticsBeta && (
                            <Badge className={css.badge} type={ColorType.Blue}>
                                new
                            </Badge>
                        )}
                    </NavbarLink>

                    {hasAnalyticsBeta && (
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/weekly-ticket-load"
                        >
                            Weekly ticket load
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
                        to="/app/stats/support-performance-agents"
                    >
                        Agents
                    </NavbarLink>
                    <NavbarLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/satisfaction"
                    >
                        Satisfaction
                    </NavbarLink>
                    {!(isRevenueSubscriber && hasAttributionModel) && (
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/revenue"
                        >
                            Revenue
                        </NavbarLink>
                    )}
                </div>
            </NavbarBlock>
            <NavbarBlock icon="bolt" title="Automations">
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
                    {isAutomationSettingsRevampEnabled ? (
                        !hasAutomationAddOn ? (
                            <>
                                <AutomationNavbarAddOnPaywallNavbarLink
                                    to="/app/stats/automation-add-on"
                                    exact
                                    onSubscribeToAutomationAddOnClick={() => {
                                        setIsAutomationSubscriptionModal(true)
                                    }}
                                >
                                    Automation Add-on
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
                                to="/app/stats/automation-add-on"
                            >
                                Automation Add-on
                            </NavbarLink>
                        )
                    ) : (
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/self-service"
                        >
                            Self-service
                        </NavbarLink>
                    )}
                </div>
            </NavbarBlock>
            {isRevenueSubscriber && hasAttributionModel && (
                <NavbarBlock icon="attach_money" title="Revenue">
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
                        <Badge type={ColorType.Blue} className={css.badge}>
                            BETA
                        </Badge>
                    </NavbarLink>
                </NavbarBlock>
            )}
        </>
    )
}
