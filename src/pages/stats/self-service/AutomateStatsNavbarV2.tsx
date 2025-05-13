import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { LINK_AI_SALES_AGENT_TEXT } from 'pages/stats/automate/aiSalesAgent/constants'
import {
    PAGE_TITLE_AI_AGENT,
    PAGE_TITLE_OVERVIEW,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from 'pages/stats/self-service/constants'
import { STATS_ROUTES } from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'

import { StatsNavbarViewSections } from '../common/components/StatsNavbarViewV2/constants'

import css from './AutomateStatsNavbar.less'

const OVERVIEW_PATH = `/app/stats/${STATS_ROUTES.AUTOMATE_OVERVIEW}`
const AI_AGENT_PATH = `/app/stats/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`
const PERFORMANCE_BY_FEATURE_PATH = `/app/stats/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`
const AI_SALES_AGENT_PATH = `/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`

export function AutomateStatsNavbarV2() {
    const hasAutomate = useAppSelector(getHasAutomate)

    const isAiAgentStatsPageEnabled = useFlag(FeatureFlagKey.AIAgentStatsPage)

    const isAiSalesAgentAnalyticsEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )
    const canUseAiSalesAgent = useCanUseAiSalesAgent()

    return (
        <Navigation.Section value={StatsNavbarViewSections.Automate}>
            <Navigation.SectionTrigger data-candu-id="navbar-block-ai-agent">
                AI Agent
                <Navigation.SectionIndicator />
            </Navigation.SectionTrigger>
            <Navigation.SectionContent className={css.sectionContent}>
                {!hasAutomate ? (
                    <Navigation.SectionItem
                        as={NavLink}
                        to={OVERVIEW_PATH}
                        displayType="indent"
                        className={css.item}
                    >
                        {PAGE_TITLE_OVERVIEW}
                        <UpgradeIcon />
                    </Navigation.SectionItem>
                ) : (
                    <>
                        <Navigation.SectionItem
                            as={NavLink}
                            to={OVERVIEW_PATH}
                            exact
                            displayType="indent"
                            data-candu-id="statistics-automate-link-overview"
                        >
                            {PAGE_TITLE_OVERVIEW}
                        </Navigation.SectionItem>

                        {isAiAgentStatsPageEnabled && (
                            <Navigation.SectionItem
                                as={NavLink}
                                to={AI_AGENT_PATH}
                                exact
                                displayType="indent"
                                data-candu-id="statistics-automate-ai-agent"
                            >
                                {PAGE_TITLE_AI_AGENT}
                            </Navigation.SectionItem>
                        )}

                        {isAiSalesAgentAnalyticsEnabled && (
                            <Navigation.SectionItem
                                as={NavLink}
                                to={AI_SALES_AGENT_PATH}
                                exact
                                displayType="indent"
                                data-candu-id="statistics-ai-sales-agent"
                                className={css.item}
                            >
                                {LINK_AI_SALES_AGENT_TEXT}
                                {!canUseAiSalesAgent && <UpgradeIcon />}
                            </Navigation.SectionItem>
                        )}

                        <Navigation.SectionItem
                            as={NavLink}
                            to={PERFORMANCE_BY_FEATURE_PATH}
                            exact
                            displayType="indent"
                            data-candu-id="statistics-automate-performance-by-feature"
                        >
                            {PAGE_TITLE_PERFORMANCE_BY_FEATURES}
                        </Navigation.SectionItem>
                    </>
                )}
            </Navigation.SectionContent>
        </Navigation.Section>
    )
}
