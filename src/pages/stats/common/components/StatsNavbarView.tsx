import React, {ReactNode, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classNames from 'classnames'

import cssNavbar from 'assets/css/navbar.less'
import {FeatureFlagKey} from 'config/featureFlags'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import AutomationNavbarAddOnPaywallNavbarLink from 'pages/automation/common/components/AutomationNavbarAddOnPaywallNavbarLink'
import {
    AUTOMATION_ADD_ON_FEATURES_PATH,
    AUTOMATION_ADD_ON_PATH,
    PAGE_TITLE_AAO,
    PAGE_TITLE_AAO_FEATURES,
} from 'pages/stats/self-service/constants'
import {
    getIntegrationsList,
    hasIntegrationOfTypes,
} from 'state/integrations/selectors'
import {Category} from 'models/integration/types/app'

const COMMON_NAV_LINK_PROPS: Partial<NavbarLinkProps> = {
    exact: true,
}

export default function StatsNavbarView() {
    const hasAnalyticsTicketInsights: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsTicketInsights]

    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModal,
    ] = useState(false)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const isNewAutomationAddonEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.NewAutomationAddon]

    const isConvertSubscriber = useIsConvertSubscriber()
    const integrationsList = useAppSelector(getIntegrationsList)
    const hasEcommerceIntegerations = useAppSelector(
        hasIntegrationOfTypes(
            integrationsList
                .filter((integration) =>
                    integration.categories.includes(Category.ECOMMERCE)
                )
                .map((integration) => integration.type)
        )
    )
    const automationAddon: {
        label: ReactNode
        to: string
    }[] = [
        {
            label: isNewAutomationAddonEnabled
                ? PAGE_TITLE_AAO_FEATURES
                : PAGE_TITLE_AAO,
            to: AUTOMATION_ADD_ON_FEATURES_PATH,
        },
    ]
    isNewAutomationAddonEnabled &&
        automationAddon.unshift({
            label: (
                <>
                    {PAGE_TITLE_AAO}
                    {hasAutomationAddOn && hasEcommerceIntegerations && (
                        <Badge
                            type={ColorType.Blue}
                            className={cssNavbar.badge}
                        >
                            NEW
                        </Badge>
                    )}
                </>
            ),
            to: AUTOMATION_ADD_ON_PATH,
        })
    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className={cssNavbar.menu}>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/live-overview"
                        >
                            Overview
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/live-agents"
                        >
                            Agents
                        </NavbarLink>
                    </div>
                </div>
            </NavbarBlock>
            <NavbarBlock icon="insights" title="Support Performance">
                <div className={cssNavbar.menu}>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/support-performance-overview"
                        >
                            Overview
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/support-performance-agents"
                        >
                            Agents
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/busiest-times-of-days"
                        >
                            Busiest times of days
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
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
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/tags"
                        >
                            Tags
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/channels"
                        >
                            Channels
                        </NavbarLink>
                    </div>

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/satisfaction"
                        >
                            Satisfaction
                        </NavbarLink>
                    </div>
                    {!isConvertSubscriber && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested
                            )}
                        >
                            <NavbarLink
                                {...COMMON_NAV_LINK_PROPS}
                                to="/app/stats/revenue"
                            >
                                Revenue
                            </NavbarLink>
                        </div>
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
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/macros"
                        >
                            Macros
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/intents"
                        >
                            Intents
                        </NavbarLink>
                    </div>
                    {!hasAutomationAddOn ? (
                        <>
                            {automationAddon.map((aao) => (
                                <AutomationNavbarAddOnPaywallNavbarLink
                                    to={aao.to}
                                    key={aao.to}
                                    exact
                                    onSubscribeToAutomationAddOnClick={() => {
                                        setIsAutomationSubscriptionModal(true)
                                    }}
                                >
                                    {aao.label}
                                </AutomationNavbarAddOnPaywallNavbarLink>
                            ))}
                            <AutomationSubscriptionModal
                                confirmLabel="Subscribe"
                                isOpen={isAutomationSubscriptionModalOpen}
                                onClose={() =>
                                    setIsAutomationSubscriptionModal(false)
                                }
                            />
                        </>
                    ) : (
                        <>
                            {automationAddon.map((aao) => (
                                <div
                                    key={aao.to}
                                    className={classNames(
                                        cssNavbar['link-wrapper'],
                                        cssNavbar.isNested
                                    )}
                                >
                                    <NavbarLink
                                        {...COMMON_NAV_LINK_PROPS}
                                        to={aao.to}
                                    >
                                        {aao.label}
                                    </NavbarLink>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </NavbarBlock>
            {isConvertSubscriber && (
                <NavbarBlock icon="attach_money" title="Convert">
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/revenue"
                        >
                            Overview
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
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
                    </div>
                </NavbarBlock>
            )}
        </>
    )
}
