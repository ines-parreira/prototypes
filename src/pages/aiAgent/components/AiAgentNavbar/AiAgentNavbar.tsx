import React from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import navbarCss from 'assets/css/navbar.less'
import { ActiveContent, Navbar } from 'common/navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import css from 'pages/convert/common/components/ConvertNavbar/ConvertNavbar.less'
import { getHasAutomate } from 'state/billing/selectors'

import { AiAgentNavbarView } from './AiAgentNavbarView'

export const AiAgentNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview =
        useFlags()[FeatureFlagKey.AIAgentPreviewModeAllowed]
    const hasStandaloneConvAiOverviewPage =
        useFlags()[FeatureFlagKey.StandaloneConvAiOverviewPage]

    if (!hasAutomate && !hasAiAgentPreview) {
        return <Navbar activeContent={ActiveContent.AiAgent} title="AI Agent" />
    }

    return (
        <Navbar activeContent={ActiveContent.AiAgent} title="AI Agent">
            {hasStandaloneConvAiOverviewPage && (
                <div
                    className={classNames(
                        navbarCss['link-wrapper'],
                        css.navbarItem,
                    )}
                >
                    <NavbarLink to="/app/ai-agent/overview" exact>
                        <span data-candu-id="ai-agent-navbar-overview">
                            Overview
                        </span>
                    </NavbarLink>
                </div>
            )}

            <AiAgentNavbarView />
        </Navbar>
    )
}
