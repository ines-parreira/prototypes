import classNames from 'classnames'
import React from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import AutomateNavbarPaywallNavbarLink from 'pages/automate/common/components/AutomateNavbarPaywallNavbarLink'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import cssNavbar from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    ROUTE_AUTOMATE_OVERVIEW,
    PAGE_TITLE_OVERVIEW,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_AI_AGENT,
    PAGE_TITLE_AI_AGENT,
} from './constants'

type Props = {
    commonNavLinkProps: Partial<NavbarLinkProps>
}

const OVERVIEW_PATH = `/app/stats/${ROUTE_AUTOMATE_OVERVIEW}`
const AI_AGENT_PATH = `/app/stats/${ROUTE_AUTOMATE_AI_AGENT}`
const PERFORMANCE_BY_FEATURE_PATH = `/app/stats/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`

export default function AutomateStatsNavbar({commonNavLinkProps}: Props) {
    const hasAutomate = useAppSelector(getHasAutomate)

    const isAiAgentStatsPageEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AIAgentStatsPage]

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
                            cssNavbar.isNested
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
                                cssNavbar.isNested
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

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
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
