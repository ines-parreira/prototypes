import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { UserRole } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'

import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import { STATS_ROUTES } from 'routes/constants'
import { currentAccountHasProduct } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export const ANALYTICS_DEFAULT_PATH = '/app/stats'

export type StatsNavbarViewSectionsConfig = {
    id: string
    label: string
    icon: IconName
    requiredRole?: UserRole.Admin | UserRole.Agent
}

export type StatsNavbarSection = {
    id: string
    label: string
    icon: IconName
    sectionCanduId?: string
    items?: {
        key: string
        route: string
        label: string
        canduId?: string
        itemId?: string
        requiresUpgrade?: boolean
    }[]
}

export const analyticsSections: Record<
    StatsNavbarViewSections,
    StatsNavbarViewSectionsConfig
> = {
    [StatsNavbarViewSections.Automate]: {
        id: 'automate',
        label: 'Automate',
        icon: 'zap',
    },
    [StatsNavbarViewSections.Convert]: {
        id: 'convert',
        label: 'Convert',
        icon: 'attach-money',
    },
    [StatsNavbarViewSections.Dashboards]: {
        id: 'dashboards',
        label: 'Dashboards',
        icon: 'chart-line-alt',
    },
    [StatsNavbarViewSections.Live]: {
        id: 'live',
        label: 'Live',
        icon: 'system-monitor-play',
    },
    [StatsNavbarViewSections.SupportPerformance]: {
        id: 'support-performance',
        label: 'Support Performance',
        icon: 'user-check',
    },
    [StatsNavbarViewSections.TicketInsights]: {
        id: 'ticket-insights',
        label: 'Ticket Insights',
        icon: 'inbox',
    },
    [StatsNavbarViewSections.QualityManagement]: {
        id: 'quality-management',
        label: 'Quality Management',
        icon: 'wavy-check',
    },
    [StatsNavbarViewSections.Voice]: {
        id: 'voice',
        label: 'Voice',
        icon: 'soundwave',
    },
}

export function useStatsNavbarConfig() {
    const user = useAppSelector(getCurrentUser)
    const hasVoiceFeature = useAppSelector(
        currentAccountHasProduct(ProductType.Voice),
    )
    const { hasAccess } = useAiAgentAccess()
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isNewSatisfactionReportEnabled = useFlag(
        FeatureFlagKey.NewSatisfactionReport,
    )

    const isAutoQANavLinkAvailable = useMemo(
        () => isTeamLeadOrAdmin && hasAccess,
        [hasAccess, isTeamLeadOrAdmin],
    )

    const sections = useMemo<StatsNavbarSection[]>(() => {
        return [
            {
                id: StatsNavbarViewSections.Live,
                label: analyticsSections[StatsNavbarViewSections.Live].label,
                icon: analyticsSections[StatsNavbarViewSections.Live].icon,
                sectionCanduId: 'navbar-block-live',
                items: [
                    {
                        key: 'live-overview',
                        route: STATS_ROUTES.LIVE_OVERVIEW,
                        label: 'Overview',
                    },
                    {
                        key: 'live-agents',
                        route: STATS_ROUTES.LIVE_AGENTS,
                        label: 'Agents',
                    },
                    {
                        key: 'live-voice',
                        route: STATS_ROUTES.LIVE_VOICE,
                        label: 'Voice',
                        itemId: 'live-voice',
                        requiresUpgrade: !hasVoiceFeature,
                    },
                ],
            },
            {
                id: StatsNavbarViewSections.Dashboards,
                label: analyticsSections[StatsNavbarViewSections.Dashboards]
                    .label,
                icon: analyticsSections[StatsNavbarViewSections.Dashboards]
                    .icon,
                items: [],
            },
            {
                id: StatsNavbarViewSections.SupportPerformance,
                label: analyticsSections[
                    StatsNavbarViewSections.SupportPerformance
                ].label,
                icon: analyticsSections[
                    StatsNavbarViewSections.SupportPerformance
                ].icon,
                sectionCanduId: 'navbar-block-support-performance',
                items: [
                    {
                        key: 'support-performance-overview',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW,
                        label: 'Overview',
                    },
                    {
                        key: 'support-performance-agents',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS,
                        label: 'Agents',
                    },
                    {
                        key: 'support-performance-busiest-times',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_BUSIEST_TIMES,
                        label: 'Busiest Times',
                        canduId: 'statistics-link-busiest-times-of-days',
                    },
                    {
                        key: 'support-performance-channels',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_CHANNELS,
                        label: 'Channels',
                    },
                    {
                        key: 'support-performance-satisfaction',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION,
                        label: 'Satisfaction',
                    },
                    {
                        key: 'support-performance-revenue',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_REVENUE,
                        label: 'Revenue',
                    },
                    {
                        key: 'support-performance-help-center',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER,
                        label: 'Help Center',
                        canduId: 'statistics-link-help-center',
                    },
                    {
                        key: 'support-performance-slas',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT,
                        label: 'SLAs',
                    },
                    ...(!isNewSatisfactionReportEnabled
                        ? [
                              {
                                  key: 'auto-qa',
                                  route: STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA,
                                  label: 'Auto QA',
                              },
                          ]
                        : []),
                ],
            },
            {
                id: StatsNavbarViewSections.TicketInsights,
                label: analyticsSections[StatsNavbarViewSections.TicketInsights]
                    .label,
                icon: analyticsSections[StatsNavbarViewSections.TicketInsights]
                    .icon,
                sectionCanduId: 'navbar-block-ticket-insights',
                items: [
                    {
                        key: 'ticket-insights-ticket-fields',
                        route: STATS_ROUTES.TICKET_INSIGHTS_TICKET_FIELDS,
                        label: 'Ticket Fields',
                    },
                    {
                        key: 'ticket-insights-tags',
                        route: STATS_ROUTES.TICKET_INSIGHTS_TAGS,
                        label: 'Tags',
                    },
                    {
                        key: 'ticket-insights-macros',
                        route: STATS_ROUTES.TICKET_INSIGHTS_MACROS,
                        label: 'Macros',
                    },
                    {
                        key: 'ticket-insights-intents',
                        route: STATS_ROUTES.TICKET_INSIGHTS_INTENTS,
                        label: 'Intents',
                        canduId: 'statistics-link-intents',
                    },
                ],
            },
            ...(isNewSatisfactionReportEnabled
                ? [
                      {
                          id: StatsNavbarViewSections.QualityManagement,
                          label: analyticsSections[
                              StatsNavbarViewSections.QualityManagement
                          ].label,
                          icon: analyticsSections[
                              StatsNavbarViewSections.QualityManagement
                          ].icon,
                          sectionCanduId: 'navbar-block-quality-management',
                          items: [
                              ...(isAutoQANavLinkAvailable
                                  ? [
                                        {
                                            key: 'auto-qa',
                                            route: STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA,
                                            label: 'Auto QA',
                                        },
                                    ]
                                  : []),
                              {
                                  key: 'quality-management-satisfaction',
                                  route: STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION,
                                  label: 'Satisfaction',
                              },
                          ],
                      },
                  ]
                : []),
            {
                id: StatsNavbarViewSections.Automate,
                label: analyticsSections[StatsNavbarViewSections.Automate]
                    .label,
                icon: analyticsSections[StatsNavbarViewSections.Automate].icon,
                items: [],
            },
            {
                id: StatsNavbarViewSections.Convert,
                label: analyticsSections[StatsNavbarViewSections.Convert].label,
                icon: analyticsSections[StatsNavbarViewSections.Convert].icon,
                items: [],
            },
            {
                id: StatsNavbarViewSections.Voice,
                label: analyticsSections[StatsNavbarViewSections.Voice].label,
                icon: analyticsSections[StatsNavbarViewSections.Voice].icon,
                sectionCanduId: 'navbar-block-voice',
                items: [
                    {
                        key: 'voice-overview',
                        route: STATS_ROUTES.VOICE_OVERVIEW,
                        label: 'Overview',
                        requiresUpgrade: !hasVoiceFeature,
                    },
                    {
                        key: 'voice-agents',
                        route: STATS_ROUTES.VOICE_AGENTS,
                        label: 'Agents',
                        requiresUpgrade: !hasVoiceFeature,
                    },
                ],
            },
        ]
    }, [
        isNewSatisfactionReportEnabled,
        isAutoQANavLinkAvailable,
        hasVoiceFeature,
    ])

    return { sections }
}
