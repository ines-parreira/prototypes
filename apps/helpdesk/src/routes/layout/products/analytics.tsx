import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { UserRole } from '@repo/utils'

import { Tag } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { LINK_AI_SALES_AGENT_TEXT } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import { CreateDashboardMenu } from 'domains/reporting/pages/dashboards/CreateDashboardMenu/CreateDashboardMenu'
import {
    PAGE_TITLE_AI_AGENT,
    PAGE_TITLE_OVERVIEW,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
    ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
} from 'domains/reporting/pages/self-service/constants'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
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
    actionsSlot?: ReactNode
    items?: {
        id: string
        route: string
        label: string
        canduId?: string
        itemId?: string
        requiresUpgrade?: boolean
        trailingSlot?: ReactNode
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
        label: 'Ticket insights',
        icon: 'inbox',
    },
    [StatsNavbarViewSections.QualityManagement]: {
        id: 'quality-management',
        label: 'Quality management',
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
    const canUseAiSalesAgent = useCanUseAiSalesAgent()
    const { getDashboardsHandler } = useDashboardActions()
    const isConvertSubscriber = useIsConvertSubscriber()
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isNewSatisfactionReportEnabled = useFlag(
        FeatureFlagKey.NewSatisfactionReport,
    )
    const isAiAgentStatsPageEnabled = useFlag(FeatureFlagKey.AIAgentStatsPage)
    const isAiSalesAgentAnalyticsEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )
    const isAnalyticsDashboardsNewScreensEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens,
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
                        id: 'live-overview',
                        route: STATS_ROUTES.LIVE_OVERVIEW,
                        label: 'Overview',
                    },
                    {
                        id: 'live-agents',
                        route: STATS_ROUTES.LIVE_AGENTS,
                        label: 'Agents',
                    },
                    {
                        id: 'live-voice',
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
                actionsSlot: <CreateDashboardMenu />,
                items: getDashboardsHandler().map((dashboard) => ({
                    id: `dashboard-${dashboard.id}`,
                    route: STATS_ROUTES.DASHBOARDS_PAGE.replace(
                        ':id',
                        String(dashboard.id),
                    ),
                    label: dashboard.emoji
                        ? `${dashboard.emoji} ${dashboard.name}`
                        : dashboard.name,
                })),
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
                        id: 'support-performance-overview',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW,
                        label: 'Overview',
                    },
                    {
                        id: 'support-performance-agents',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS,
                        label: 'Agents',
                    },
                    {
                        id: 'support-performance-busiest-times',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_BUSIEST_TIMES,
                        label: 'Busiest times',
                        canduId: 'statistics-link-busiest-times-of-days',
                    },
                    {
                        id: 'support-performance-channels',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_CHANNELS,
                        label: 'Channels',
                    },
                    {
                        id: 'support-performance-satisfaction',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION,
                        label: 'Satisfaction',
                    },
                    {
                        id: 'support-performance-revenue',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_REVENUE,
                        label: 'Revenue',
                    },
                    {
                        id: 'support-performance-help-center',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER,
                        label: 'Help Center',
                        canduId: 'statistics-link-help-center',
                    },
                    {
                        id: 'support-performance-slas',
                        route: STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT,
                        label: 'SLAs',
                    },
                    ...(!isNewSatisfactionReportEnabled
                        ? [
                              {
                                  id: 'auto-qa',
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
                        id: 'ticket-insights-ticket-fields',
                        route: STATS_ROUTES.TICKET_INSIGHTS_TICKET_FIELDS,
                        label: 'Ticket Fields',
                    },
                    {
                        id: 'ticket-insights-tags',
                        route: STATS_ROUTES.TICKET_INSIGHTS_TAGS,
                        label: 'Tags',
                    },
                    {
                        id: 'ticket-insights-macros',
                        route: STATS_ROUTES.TICKET_INSIGHTS_MACROS,
                        label: 'Macros',
                    },
                    {
                        id: 'ticket-insights-intents',
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
                                            id: 'auto-qa',
                                            route: STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA,
                                            label: 'Auto QA',
                                        },
                                    ]
                                  : []),
                              {
                                  id: 'quality-management-satisfaction',
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
                items: hasAccess
                    ? [
                          ...(isAnalyticsDashboardsNewScreensEnabled
                              ? [
                                    {
                                        id: 'analytics-overview',
                                        route: STATS_ROUTES.ANALYTICS_OVERVIEW,
                                        label: PAGE_TITLE_OVERVIEW,
                                        trailingSlot: (
                                            <Tag color="grey">Beta</Tag>
                                        ),
                                    },
                                    {
                                        id: 'analytics-ai-agent',
                                        route: STATS_ROUTES.ANALYTICS_AI_AGENT,
                                        label: PAGE_TITLE_AI_AGENT,
                                        trailingSlot: (
                                            <Tag color="grey">Beta</Tag>
                                        ),
                                    },
                                ]
                              : []),
                          {
                              id: 'automate-overview',
                              route: STATS_ROUTES.AI_AGENT_OVERVIEW,
                              label: PAGE_TITLE_OVERVIEW,
                          },
                          ...(isAiAgentStatsPageEnabled
                              ? [
                                    {
                                        id: 'automate-ai-agent',
                                        route: STATS_ROUTES.AUTOMATE_AI_AGENTS,
                                        label: PAGE_TITLE_AI_AGENT,
                                    },
                                ]
                              : []),
                          ...(isAiSalesAgentAnalyticsEnabled
                              ? [
                                    {
                                        id: 'ai-sales-agent',
                                        route: STATS_ROUTES.AI_SALES_AGENT_OVERVIEW,
                                        label: LINK_AI_SALES_AGENT_TEXT,
                                        requiresUpgrade: !canUseAiSalesAgent,
                                    },
                                ]
                              : []),
                          {
                              id: 'performance-by-features',
                              route: ROUTE_AUTOMATE_PERFORMANCE_BY_FEATURES,
                              label: PAGE_TITLE_PERFORMANCE_BY_FEATURES,
                          },
                      ]
                    : [
                          {
                              id: 'automate-overview',
                              route: STATS_ROUTES.AI_AGENT_OVERVIEW,
                              label: PAGE_TITLE_OVERVIEW,
                              requiresUpgrade: true,
                          },
                      ],
            },
            {
                id: StatsNavbarViewSections.Convert,
                label: analyticsSections[StatsNavbarViewSections.Convert].label,
                icon: analyticsSections[StatsNavbarViewSections.Convert].icon,
                items: [
                    {
                        id: 'convert-campaigns',
                        route: STATS_ROUTES.CONVERT_CAMPAIGNS,
                        label: 'Campaigns',
                        requiresUpgrade: !isConvertSubscriber,
                    },
                ],
            },
            {
                id: StatsNavbarViewSections.Voice,
                label: analyticsSections[StatsNavbarViewSections.Voice].label,
                icon: analyticsSections[StatsNavbarViewSections.Voice].icon,
                sectionCanduId: 'navbar-block-voice',
                items: [
                    {
                        id: 'voice-overview',
                        route: STATS_ROUTES.VOICE_OVERVIEW,
                        label: 'Overview',
                        requiresUpgrade: !hasVoiceFeature,
                    },
                    {
                        id: 'voice-agents',
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
        hasAccess,
        isAiAgentStatsPageEnabled,
        isAiSalesAgentAnalyticsEnabled,
        isAnalyticsDashboardsNewScreensEnabled,
        canUseAiSalesAgent,
        getDashboardsHandler,
        isConvertSubscriber,
    ])

    return { sections }
}
