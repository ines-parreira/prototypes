import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import { Navigation } from 'components/Navigation/Navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { ConvertStatsNavbarV2 } from 'pages/convert/common/components/ConvertStatsNavbar/ConvertStatsNavbarV2'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import { DashboardsNavbarBlockV2 } from 'pages/stats/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlockV2'
import { AutomateStatsNavbarV2 } from 'pages/stats/self-service/AutomateStatsNavbarV2'
import { STATS_ROUTES } from 'routes/constants'
import {
    currentAccountHasProduct,
    getHasAutomate,
} from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

import { StatsNavbarViewSections } from './constants'
import { StatsNavSectionItem } from './StatsNavSectionItem'
import { useStatsNavbarSections } from './useStatsNavbarSections'

import css from './StatsNavbarViewV2.less'

type FeatureFlag = boolean | undefined
type AutoQANavBarLinkProps = {
    isAvailable: boolean
}

export function StatsNavbarViewV2() {
    const { sections, handleNavigationStateChange } = useStatsNavbarSections()
    const user = useAppSelector(getCurrentUser)
    const hasVoiceFeature = useAppSelector(
        currentAccountHasProduct(ProductType.Voice),
    )
    const hasAutomate = useAppSelector(getHasAutomate)
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isNewSatisfactionReportEnabled: FeatureFlag =
        useFlags()[FeatureFlagKey.NewSatisfactionReport]

    const isAutoQANavLinkAvailable = useMemo(
        () => isTeamLeadOrAdmin && hasAutomate,
        [hasAutomate, isTeamLeadOrAdmin],
    )

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
                    >
                        Voice
                        {!hasVoiceFeature && <UpgradeIcon />}
                    </StatsNavSectionItem>
                </Navigation.SectionContent>
            </Navigation.Section>
            <DashboardsNavbarBlockV2 />
            <Navigation.Section
                value={StatsNavbarViewSections.SupportPerformance}
            >
                <Navigation.SectionTrigger data-candu-id="navbar-block-support-performance">
                    Support Performance
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
                    Ticket Insights
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
                        Quality Management
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
                            <Badge type={'blue'} className={cssNavbar.badge}>
                                NEW
                            </Badge>
                        </StatsNavSectionItem>
                    </Navigation.SectionContent>
                </Navigation.Section>
            )}

            <AutomateStatsNavbarV2 />

            <ConvertStatsNavbarV2 />

            <Navigation.Section value={StatsNavbarViewSections.Voice}>
                <Navigation.SectionTrigger data-candu-id="navbar-block-voice">
                    Voice
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
