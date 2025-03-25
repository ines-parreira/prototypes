import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import navbarCss from 'assets/css/navbar.less'
import { ActiveContent, Navbar } from 'common/navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { aiAgentRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import css from 'pages/convert/common/components/ConvertNavbar/ConvertNavbar.less'
import { getHasAutomate } from 'state/billing/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { AiAgentNavbarView } from './AiAgentNavbarView'

export const AiAgentNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview =
        useFlags()[FeatureFlagKey.AIAgentPreviewModeAllowed]
    const hasStandaloneConvAiOverviewPage =
        useFlags()[FeatureFlagKey.StandaloneConvAiOverviewPage]
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform,
    )

    if (
        (!hasAutomate && !hasAiAgentPreview) ||
        storeIntegrations.length === 0
    ) {
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
                    data-candu-id="ai-agent-navbar-overview"
                >
                    <NavbarLink to={aiAgentRoutes.overview} exact>
                        <span>Overview</span>
                    </NavbarLink>
                </div>
            )}

            {isActionsInternalPlatformEnabled && (
                <div className={navbarCss['link-wrapper']}>
                    <NavbarLink to={aiAgentRoutes.actionsPlatform}>
                        <span>Actions platform</span>
                    </NavbarLink>
                </div>
            )}

            <AiAgentNavbarView />
        </Navbar>
    )
}
