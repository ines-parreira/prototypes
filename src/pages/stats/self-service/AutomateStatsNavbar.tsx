import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import cssNavbar from 'assets/css/navbar.less'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    useAtLeastOneStoreHasActiveTrial,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import AutomateNavbarPaywallLink from 'pages/automate/common/components/AutomateNavbarPaywallNavbarLink'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import { LINK_AI_SALES_AGENT_TEXT } from 'pages/stats/automate/aiSalesAgent/constants'
import {
    PAGE_TITLE_AI_AGENT,
    PAGE_TITLE_OVERVIEW,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from 'pages/stats/self-service/constants'
import { STATS_ROUTES } from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'

type Props = {
    commonNavLinkProps: Partial<NavbarLinkProps>
}

const OVERVIEW_PATH = `/app/stats/${STATS_ROUTES.AUTOMATE_OVERVIEW}`
const AI_AGENT_PATH = `/app/stats/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`
const PERFORMANCE_BY_FEATURE_PATH = `/app/stats/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`
const AI_SALES_AGENT_PATH = `/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`

export default function AutomateStatsNavbar({ commonNavLinkProps }: Props) {
    const hasAutomate = useAppSelector(getHasAutomate)

    const isAiAgentStatsPageEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AIAgentStatsPage]

    //TODO after Automate reports refactoring is done
    return (
        <div className={cssNavbar.menu}>
            {!hasAutomate ? (
                <AutomateNavbarPaywallLink to={OVERVIEW_PATH} isNested>
                    {PAGE_TITLE_OVERVIEW}
                </AutomateNavbarPaywallLink>
            ) : (
                <>
                    <AutomateStatsLink
                        {...commonNavLinkProps}
                        to={OVERVIEW_PATH}
                        canduId="statistics-automate-link-overview"
                    >
                        {PAGE_TITLE_OVERVIEW}
                    </AutomateStatsLink>

                    {isAiAgentStatsPageEnabled && (
                        <AutomateStatsLink
                            {...commonNavLinkProps}
                            to={AI_AGENT_PATH}
                            canduId="statistics-automate-link-ai-agent"
                        >
                            {PAGE_TITLE_AI_AGENT}
                        </AutomateStatsLink>
                    )}

                    <AiSalesAgentStatsLink
                        commonNavLinkProps={commonNavLinkProps}
                    />

                    <AutomateStatsLink
                        {...commonNavLinkProps}
                        to={PERFORMANCE_BY_FEATURE_PATH}
                        canduId="statistics-automate-performance-by-feature"
                    >
                        {PAGE_TITLE_PERFORMANCE_BY_FEATURES}
                    </AutomateStatsLink>
                </>
            )}
        </div>
    )
}

const AiSalesAgentStatsLink = ({ commonNavLinkProps }: Props) => {
    const isAiSalesAgentAnalyticsEnabled: boolean | undefined = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )

    const canUseAiSalesAgent = useCanUseAiSalesAgent()
    const atLeastOneStoreHasActiveTrial = useAtLeastOneStoreHasActiveTrial()

    if (!isAiSalesAgentAnalyticsEnabled) return null

    const shouldShowRealLink =
        canUseAiSalesAgent || atLeastOneStoreHasActiveTrial

    const LinkComponent = shouldShowRealLink
        ? AutomateStatsLink
        : AutomateNavbarPaywallLink

    return (
        <LinkComponent
            {...commonNavLinkProps}
            to={AI_SALES_AGENT_PATH}
            canduId="statistics-ai-sales-agent"
            isNested
        >
            {LINK_AI_SALES_AGENT_TEXT}
        </LinkComponent>
    )
}

const AutomateStatsLink = ({
    children,
    canduId,
    ...props
}: {
    children: React.ReactNode
    canduId?: string
} & NavbarLinkProps) => (
    <div
        className={classNames(cssNavbar['link-wrapper'], cssNavbar.isNested)}
        data-candu-id={canduId}
    >
        <NavbarLink {...props}>{children}</NavbarLink>
    </div>
)
