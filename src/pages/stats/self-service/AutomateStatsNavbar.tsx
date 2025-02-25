import React from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import cssNavbar from 'assets/css/navbar.less'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import AutomateNavbarPaywallNavbarLink from 'pages/automate/common/components/AutomateNavbarPaywallNavbarLink'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import {
    LINK_AI_SALES_AGENT_TEXT,
    ROUTE_AI_SALES_AGENT_OVERVIEW,
} from 'pages/stats/aiSalesAgent/constants'
import { STATS_ROUTES } from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'

import {
    PAGE_TITLE_AI_AGENT,
    PAGE_TITLE_OVERVIEW,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_OVERVIEW,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from './constants'

type Props = {
    commonNavLinkProps: Partial<NavbarLinkProps>
}

const OVERVIEW_PATH = `/app/stats/${ROUTE_AUTOMATE_OVERVIEW}`
const AI_AGENT_PATH = `/app/stats/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`
const PERFORMANCE_BY_FEATURE_PATH = `/app/stats/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`
const AI_SALES_AGENT_PATH = `/app/stats/${ROUTE_AI_SALES_AGENT_OVERVIEW}`

export default function AutomateStatsNavbar({ commonNavLinkProps }: Props) {
    const hasAutomate = useAppSelector(getHasAutomate)

    const isAiAgentStatsPageEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AIAgentStatsPage]

    const isAiSalesAgentEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.StandaloneAiSalesAnalyticsPage]

    return (
        <div className={cssNavbar.menu}>
            {!hasAutomate ? (
                <AutomateNavbarPaywallNavbarLink to={OVERVIEW_PATH} isNested>
                    {PAGE_TITLE_OVERVIEW}
                </AutomateNavbarPaywallNavbarLink>
            ) : (
                <>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                        data-candu-id="statistics-automate-link-overview"
                    >
                        <NavbarLink {...commonNavLinkProps} to={OVERVIEW_PATH}>
                            {PAGE_TITLE_OVERVIEW}
                        </NavbarLink>
                    </div>

                    {isAiAgentStatsPageEnabled && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested,
                            )}
                            data-candu-id="statistics-automate-ai-agent"
                        >
                            <NavbarLink
                                {...commonNavLinkProps}
                                to={AI_AGENT_PATH}
                            >
                                {PAGE_TITLE_AI_AGENT}
                            </NavbarLink>
                        </div>
                    )}

                    {isAiSalesAgentEnabled && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested,
                            )}
                            data-candu-id="statistics-ai-sales-agent"
                        >
                            <NavbarLink
                                {...commonNavLinkProps}
                                to={AI_SALES_AGENT_PATH}
                            >
                                {LINK_AI_SALES_AGENT_TEXT}
                            </NavbarLink>
                        </div>
                    )}

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                        data-candu-id="statistics-automate-performance-by-feature"
                    >
                        <NavbarLink
                            {...commonNavLinkProps}
                            to={PERFORMANCE_BY_FEATURE_PATH}
                        >
                            {PAGE_TITLE_PERFORMANCE_BY_FEATURES}
                        </NavbarLink>
                    </div>
                </>
            )}
        </div>
    )
}
