import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Navigation } from 'components/Navigation/Navigation'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import css from 'domains/reporting/pages/common/components/StatsNavbarView/StatsNavbarView.less'
import { StatsNavSectionItem } from 'domains/reporting/pages/common/components/StatsNavbarView/StatsNavSectionItem'
import { useStatsNavbarSections } from 'domains/reporting/pages/common/components/StatsNavbarView/useStatsNavbarSections'
import { DashboardsNavbarBlock } from 'domains/reporting/pages/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlock'
import { AutomateStatsNavbar } from 'domains/reporting/pages/self-service/AutomateStatsNavbar'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { ConvertStatsNavbar } from 'pages/convert/common/components/ConvertStatsNavbar/ConvertStatsNavbar'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import { STATS_ROUTES } from 'routes/constants'
import { currentAccountHasProduct } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

type AutoQANavBarLinkProps = {
    isAvailable: boolean
}

export function StatsNavbarView() {
    const { sections, handleNavigationStateChange } = useStatsNavbarSections()
    const user = useAppSelector(getCurrentUser)
    const hasVoiceFeature = useAppSelector(
        currentAccountHasProduct(ProductType.Voice),
    )
    const { hasAccess } = useAiAgentAccess()
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isNewSatisfactionReportEnabled = useFlag(
        FeatureFlagKey.NewSatisfactionReport,
    )

    const { isStandaloneAiAgent } = useStandaloneAiContext()

    const isAutoQANavLinkAvailable = useMemo(
        () => isTeamLeadOrAdmin && hasAccess,
        [hasAccess, isTeamLeadOrAdmin],
    )

    if (isStandaloneAiAgent) {
        return (
            <Navigation.Root
                className={css.navigation}
                value={sections}
                onValueChange={handleNavigationStateChange}
            >
                <AutomateStatsNavbar />
            </Navigation.Root>
        )
    }

    return (
        <Navigation.Root
            className={css.navigation}
            value={sections}
            onValueChange={handleNavigationStateChange}
        >
            <Navigation.Section value={StatsNavbarViewSections.Live}>
                <Navigation.SectionTrigger data-candu-id="navbar-block-live">
                    Live
                    <Navigation.SectionIndicator />
                </Navigation.SectionTrigger>
                <Navigation.SectionContent className={css.sectionContent}>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}live-overview`}
                    >
                        Overview
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}live-agents`}
                    >
                        Agents
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}live-voice`}
                        className={css.statsLink}
                        id="live-voice"
                    >
                        Voice
                        {!hasVoiceFeature && <UpgradeIcon />}
                    </StatsNavSectionItem>
                </Navigation.SectionContent>
            </Navigation.Section>
            <DashboardsNavbarBlock />
            <Navigation.Section
                value={StatsNavbarViewSections.SupportPerformance}
            >
                <Navigation.SectionTrigger data-candu-id="navbar-block-support-performance">
                    <span className={css.sectionTriggerTitle}>
                        Support Performance
                    </span>
                    <Navigation.SectionIndicator />
                </Navigation.SectionTrigger>
                <Navigation.SectionContent className={css.sectionContent}>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`}
                    >
                        Overview
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`}
                    >
                        Agents
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_BUSIEST_TIMES}`}
                        data-candu-id={'statistics-link-busiest-times-of-days'}
                    >
                        Busiest Times
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_CHANNELS}`}
                    >
                        Channels
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION}`}
                    >
                        Satisfaction
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_REVENUE}`}
                    >
                        Revenue
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER}`}
                        data-candu-id={'statistics-link-help-center'}
                    >
                        Help Center
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT}`}
                    >
                        SLAs
                    </StatsNavSectionItem>
                    {!isNewSatisfactionReportEnabled && (
                        <AutoQANavBarLink
                            isAvailable={isAutoQANavLinkAvailable}
                        />
                    )}
                </Navigation.SectionContent>
            </Navigation.Section>
            <Navigation.Section value={StatsNavbarViewSections.TicketInsights}>
                <Navigation.SectionTrigger data-candu-id="navbar-block-ticket-insights">
                    <span className={css.sectionTriggerTitle}>
                        Ticket Insights
                    </span>
                    <Navigation.SectionIndicator />
                </Navigation.SectionTrigger>
                <Navigation.SectionContent className={css.sectionContent}>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_TICKET_FIELDS}`}
                    >
                        Ticket Fields
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_TAGS}`}
                    >
                        Tags
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_MACROS}`}
                    >
                        Macros
                    </StatsNavSectionItem>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_INTENTS}`}
                        data-candu-id={'statistics-link-intents'}
                    >
                        Intents
                    </StatsNavSectionItem>
                </Navigation.SectionContent>
            </Navigation.Section>
            {isNewSatisfactionReportEnabled && (
                <Navigation.Section
                    value={StatsNavbarViewSections.QualityManagement}
                >
                    <Navigation.SectionTrigger data-candu-id="navbar-block-quality-management">
                        <span className={css.sectionTriggerTitle}>
                            Quality Management
                        </span>
                        <Navigation.SectionIndicator />
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent className={css.sectionContent}>
                        <AutoQANavBarLink
                            isAvailable={isAutoQANavLinkAvailable}
                        />
                        <StatsNavSectionItem
                            to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION}`}
                            className={css.statsLink}
                        >
                            Satisfaction
                        </StatsNavSectionItem>
                    </Navigation.SectionContent>
                </Navigation.Section>
            )}

            <AutomateStatsNavbar />

            <ConvertStatsNavbar />

            <Navigation.Section value={StatsNavbarViewSections.Voice}>
                <Navigation.SectionTrigger data-candu-id="navbar-block-voice">
                    <span className={css.sectionTriggerTitle}>Voice</span>
                    <Navigation.SectionIndicator />
                </Navigation.SectionTrigger>
                <Navigation.SectionContent className={css.sectionContent}>
                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_OVERVIEW}`}
                        className={css.statsLink}
                    >
                        Overview
                        {!hasVoiceFeature && <UpgradeIcon />}
                    </StatsNavSectionItem>

                    <StatsNavSectionItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_AGENTS}`}
                        className={css.statsLink}
                    >
                        Agents
                        {!hasVoiceFeature && <UpgradeIcon />}
                    </StatsNavSectionItem>
                </Navigation.SectionContent>
            </Navigation.Section>
        </Navigation.Root>
    )
}

function AutoQANavBarLink({ isAvailable }: AutoQANavBarLinkProps) {
    if (!isAvailable) {
        return null
    }

    return (
        <StatsNavSectionItem to={`${STATS_ROUTE_PREFIX}auto-qa`}>
            Auto QA
        </StatsNavSectionItem>
    )
}
