import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { NavLink } from 'react-router-dom'

import { Tag } from '@gorgias/axiom'

import { Navigation } from 'components/Navigation/Navigation'
import { LINK_AI_SALES_AGENT_TEXT } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'
import css from 'domains/reporting/pages/self-service/AutomateStatsNavbar.less'
import {
    AI_AGENT_AI_AGENT_NAV_TOOLTIP,
    OVERVIEW_AI_AGENT_NAV_TOOLTIP,
    PAGE_TITLE_AI_AGENT,
    PAGE_TITLE_OVERVIEW,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from 'domains/reporting/pages/self-service/constants'
import { VideoPreviewTooltip } from 'domains/reporting/pages/self-service/VideoPreviewTooltip'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import { STATS_ROUTES } from 'routes/constants'

const OVERVIEW_PATH = `/app/stats/${STATS_ROUTES.AI_AGENT_OVERVIEW}`
const AUTOMATE_AI_AGENT_PATH = `/app/stats/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`
const PERFORMANCE_BY_FEATURE_PATH = `/app/stats/${ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES}`
const AI_SALES_AGENT_PATH = `/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`
const ANALYTICS_OVERVIEW_PATH = `/app/stats/${STATS_ROUTES.ANALYTICS_OVERVIEW}`
const ANALYTICS_AI_AGENT_PATH = `/app/stats/${STATS_ROUTES.ANALYTICS_AI_AGENT}`

export function AutomateStatsNavbar() {
    const { hasAccess } = useAiAgentAccess()
    const { isStandaloneAiAgent } = useStandaloneAiContext()

    const { value: isAiAgentStatsPageEnabled } = useFlagWithLoading(
        FeatureFlagKey.AIAgentStatsPage,
    )

    const canUseAiSalesAgent = useCanUseAiSalesAgent()

    const { value: isAnalyticsDashboardsNewScreensEnabled } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)

    const { value: isNavTooltipEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsNavTooltip,
    )

    const { value: isDisableLegacyReportsEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDisableLegacyReports,
    )

    const isLegacyReportsDisabled =
        isAnalyticsDashboardsNewScreensEnabled && isDisableLegacyReportsEnabled

    const overviewNavItem = (
        <Navigation.SectionItem
            as={NavLink}
            to={ANALYTICS_OVERVIEW_PATH}
            exact
            displayType="indent"
        >
            <div className={css.navItemWithBadge}>
                {PAGE_TITLE_OVERVIEW}
                <Tag size="sm" color="purple" className={css.newBadge}>
                    {isLegacyReportsDisabled ? 'New' : 'Beta'}
                </Tag>
            </div>
        </Navigation.SectionItem>
    )

    const aiAgentNavItem = (
        <Navigation.SectionItem
            as={NavLink}
            to={ANALYTICS_AI_AGENT_PATH}
            exact
            displayType="indent"
        >
            <div className={css.navItemWithBadge}>
                {PAGE_TITLE_AI_AGENT}
                <Tag size="sm" color="purple" className={css.newBadge}>
                    {isLegacyReportsDisabled ? 'New' : 'Beta'}
                </Tag>
            </div>
        </Navigation.SectionItem>
    )

    return (
        <Navigation.Section value={StatsNavbarViewSections.Automate}>
            <Navigation.SectionTrigger data-candu-id="navbar-block-ai-agent">
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
                                {isNavTooltipEnabled ? (
                                    <VideoPreviewTooltip
                                        {...OVERVIEW_AI_AGENT_NAV_TOOLTIP}
                                    >
                                        {overviewNavItem}
                                    </VideoPreviewTooltip>
                                ) : (
                                    overviewNavItem
                                )}
                            </ProtectedRoute>
                        )}

                        {isAnalyticsDashboardsNewScreensEnabled && (
                            <ProtectedRoute path={ANALYTICS_AI_AGENT_PATH}>
                                {isNavTooltipEnabled ? (
                                    <VideoPreviewTooltip
                                        {...AI_AGENT_AI_AGENT_NAV_TOOLTIP}
                                    >
                                        {aiAgentNavItem}
                                    </VideoPreviewTooltip>
                                ) : (
                                    aiAgentNavItem
                                )}
                            </ProtectedRoute>
                        )}

                        {!isLegacyReportsDisabled && (
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
                        )}

                        {!isLegacyReportsDisabled &&
                            isAiAgentStatsPageEnabled && (
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

                        {!isLegacyReportsDisabled && (
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

                        {!isLegacyReportsDisabled && !isStandaloneAiAgent && (
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
