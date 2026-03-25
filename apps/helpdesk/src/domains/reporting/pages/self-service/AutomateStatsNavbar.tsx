import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { NavLink } from 'react-router-dom'

import { Tag } from '@gorgias/axiom'

import { Navigation } from 'components/Navigation/Navigation'
import { LINK_AI_SALES_AGENT_TEXT } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import css from 'domains/reporting/pages/self-service/AutomateStatsNavbar.less'
import {
    PAGE_TITLE_AI_AGENT,
    PAGE_TITLE_OVERVIEW,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from 'domains/reporting/pages/self-service/constants'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import { STATS_ROUTES } from 'routes/constants'
import { analyticsSections } from 'routes/layout/products/analytics'

const OVERVIEW_PATH = `/app/stats/${STATS_ROUTES.AI_AGENT_OVERVIEW}`
const AUTOMATE_AI_AGENT_PATH = `/app/stats/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`
const PERFORMANCE_BY_FEATURE_PATH = `/app/stats/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`
const AI_SALES_AGENT_PATH = `/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`
const ANALYTICS_OVERVIEW_PATH = `/app/stats/${STATS_ROUTES.ANALYTICS_OVERVIEW}`
const ANALYTICS_AI_AGENT_PATH = `/app/stats/${STATS_ROUTES.ANALYTICS_AI_AGENT}`

export function AutomateStatsNavbar() {
    const { hasAccess } = useAiAgentAccess()
    const { isStandaloneAiAgent } = useStandaloneAiContext()

    const isAiAgentStatsPageEnabled = useFlag(FeatureFlagKey.AIAgentStatsPage)

    const isAiSalesAgentAnalyticsEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )
    const canUseAiSalesAgent = useCanUseAiSalesAgent()

    const isAnalyticsDashboardsNewScreensEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens,
    )

    return (
        <Navigation.Section
            value={analyticsSections[StatsNavbarViewSections.Automate].id}
            icon={analyticsSections[StatsNavbarViewSections.Automate].icon}
        >
            <Navigation.SectionTrigger
                data-candu-id="navbar-block-ai-agent"
                icon={analyticsSections[StatsNavbarViewSections.Automate].icon}
            >
                <span className={css.sectionTriggerTitle}>
                    {isAnalyticsDashboardsNewScreensEnabled
                        ? 'AI & Automation'
                        : 'AI Agent'}
                </span>
                <Navigation.SectionIndicator />
            </Navigation.SectionTrigger>
            <Navigation.SectionContent className={css.sectionContent}>
                {!hasAccess ? (
                    <ProtectedRoute path={OVERVIEW_PATH}>
                        <Navigation.SectionItem
                            as={NavLink}
                            to={OVERVIEW_PATH}
                            displayType="indent"
                            className={css.item}
                        >
                            {PAGE_TITLE_OVERVIEW}
                            <UpgradeIcon />
                        </Navigation.SectionItem>
                    </ProtectedRoute>
                ) : (
                    <>
                        {isAnalyticsDashboardsNewScreensEnabled && (
                            <ProtectedRoute path={ANALYTICS_OVERVIEW_PATH}>
                                <Navigation.SectionItem
                                    as={NavLink}
                                    to={ANALYTICS_OVERVIEW_PATH}
                                    exact
                                    displayType="indent"
                                >
                                    <div className={css.navItemWithBadge}>
                                        {PAGE_TITLE_OVERVIEW}
                                        <Tag
                                            size="sm"
                                            color="purple"
                                            className={css.newBadge}
                                        >
                                            Beta
                                        </Tag>
                                    </div>
                                </Navigation.SectionItem>
                            </ProtectedRoute>
                        )}

                        {isAnalyticsDashboardsNewScreensEnabled && (
                            <ProtectedRoute path={ANALYTICS_AI_AGENT_PATH}>
                                <Navigation.SectionItem
                                    as={NavLink}
                                    to={ANALYTICS_AI_AGENT_PATH}
                                    exact
                                    displayType="indent"
                                >
                                    <div className={css.navItemWithBadge}>
                                        {PAGE_TITLE_AI_AGENT}
                                        <Tag
                                            size="sm"
                                            color="purple"
                                            className={css.newBadge}
                                        >
                                            Beta
                                        </Tag>
                                    </div>
                                </Navigation.SectionItem>
                            </ProtectedRoute>
                        )}

                        <ProtectedRoute path={OVERVIEW_PATH}>
                            <Navigation.SectionItem
                                as={NavLink}
                                to={OVERVIEW_PATH}
                                exact
                                displayType="indent"
                                data-candu-id="statistics-automate-link-overview"
                            >
                                {PAGE_TITLE_OVERVIEW}
                            </Navigation.SectionItem>
                        </ProtectedRoute>

                        {isAiAgentStatsPageEnabled && (
                            <ProtectedRoute path={AUTOMATE_AI_AGENT_PATH}>
                                <Navigation.SectionItem
                                    as={NavLink}
                                    to={AUTOMATE_AI_AGENT_PATH}
                                    exact
                                    displayType="indent"
                                    data-candu-id="statistics-automate-ai-agent"
                                >
                                    {PAGE_TITLE_AI_AGENT}
                                </Navigation.SectionItem>
                            </ProtectedRoute>
                        )}

                        {isAiSalesAgentAnalyticsEnabled && (
                            <ProtectedRoute path={AI_SALES_AGENT_PATH}>
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
                            </ProtectedRoute>
                        )}

                        {!isStandaloneAiAgent && (
                            <ProtectedRoute path={PERFORMANCE_BY_FEATURE_PATH}>
                                <Navigation.SectionItem
                                    as={NavLink}
                                    to={PERFORMANCE_BY_FEATURE_PATH}
                                    exact
                                    displayType="indent"
                                    data-candu-id="statistics-automate-performance-by-feature"
                                >
                                    {PAGE_TITLE_PERFORMANCE_BY_FEATURES}
                                </Navigation.SectionItem>
                            </ProtectedRoute>
                        )}
                    </>
                )}
            </Navigation.SectionContent>
        </Navigation.Section>
    )
}
