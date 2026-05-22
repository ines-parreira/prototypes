import { useCallback, useMemo, useRef } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { getPreviousUrl } from '@repo/routing'
import moment from 'moment/moment'

import { Box } from '@gorgias/axiom'

import { DashboardExportButton } from '@repo/reporting'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import {
    isPeriodBeforeDate,
    STORES_FILTER_AVAILABILITY_DATE,
} from 'domains/reporting/pages/common/filters/utils'
import { AnalyticsPage } from 'domains/reporting/pages/common/layout/AnalyticsPage'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useSearchParam } from 'hooks/useSearchParam'

import { AiAgentDashboardLayoutRenderer } from 'pages/aiAgent/analyticsOverview/components/AiAgentDashboardLayoutRenderer'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { SalesPaywallMiddlewareRouter } from 'pages/aiAgent/Overview/middlewares/SalesPaywallMiddlewareRouter'
import { STATS_ROUTES } from 'routes/constants'
import { AnalyticsAiAgentAllAgentsReportConfig } from '../AnalyticsAiAgentAllAgentsReportConfig'
import { AnalyticsAiAgentShoppingAssistantReportConfig } from '../AnalyticsAiAgentShoppingAssistantReportConfig'
import { AnalyticsAiAgentSupportAgentReportConfig } from '../AnalyticsAiAgentSupportAgentReportConfig'
import { ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT } from '../config/aiAgentAllAgentsLayoutConfig'
import { ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT } from '../config/aiAgentShoppingAssistantLayoutConfig'
import { ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT } from '../config/aiAgentSupportAgentLayoutConfig'
import {
    AiAgentAnalyticsContent,
    AiAgentAnalyticsQueryParams,
    MIN_DATE_FOR_AI_AGENT,
} from '../constants'
import { useExportAiAgentAllAgentsToCSV } from '../hooks/useExportAiAgentAllAgentsToCSV'
import { useExportAiAgentShoppingAssistantToCSV } from '../hooks/useExportAiAgentShoppingAssistantToCSV'
import { useExportAiAgentSupportAgentToCSV } from '../hooks/useExportAiAgentSupportAgentToCSV'

const AI_AGENT_TAB_PARAM = 'ai-agent-tab'

const HEADER_NAVBAR_ITEMS = [
    {
        param: AiAgentAnalyticsQueryParams.AllAgents,
        title: AiAgentAnalyticsContent.AllAgents,
        reportConfig: AnalyticsAiAgentAllAgentsReportConfig,
    },
    {
        param: AiAgentAnalyticsQueryParams.SupportAgent,
        title: AiAgentAnalyticsContent.SupportAgent,
        reportConfig: AnalyticsAiAgentSupportAgentReportConfig,
    },
    {
        param: AiAgentAnalyticsQueryParams.ShoppingAssistant,
        title: AiAgentAnalyticsContent.ShoppingAssistant,
        reportConfig: AnalyticsAiAgentShoppingAssistantReportConfig,
    },
] as const

export const AnalyticsAiAgentLayout = () => {
    useCleanStatsFilters()
    const contentRef = useRef<HTMLDivElement>(null)
    const {
        onAnalyticsReportViewed,
        onAnalyticsAiAgentTabSelected,
        onTableTabInteraction,
        onExport,
    } = useAiAgentAnalyticsDashboardTracking()
    const canUseAiSalesAgent = useCanUseAiSalesAgent()

    useEffectOnce(() => {
        const previousUrl = getPreviousUrl()
        const previousReport = previousUrl?.split('/app/')[1] ?? '-'

        onAnalyticsReportViewed({
            reportName: STATS_ROUTES.ANALYTICS_AI_AGENT,
            previousReport,
        })
    })

    const [aiagentTab] = useSearchParam(AI_AGENT_TAB_PARAM)

    const activeTab = aiagentTab || AiAgentAnalyticsQueryParams.AllAgents

    const activeTabConfig = useMemo(() => {
        return (
            HEADER_NAVBAR_ITEMS.find((item) => item.param === activeTab) ||
            HEADER_NAVBAR_ITEMS[0]
        )
    }, [activeTab])

    const useCsvExport = useMemo(() => {
        switch (activeTab) {
            case AiAgentAnalyticsQueryParams.SupportAgent:
                return useExportAiAgentSupportAgentToCSV
            case AiAgentAnalyticsQueryParams.ShoppingAssistant:
                return useExportAiAgentShoppingAssistantToCSV
            case AiAgentAnalyticsQueryParams.AllAgents:
            default:
                return useExportAiAgentAllAgentsToCSV
        }
    }, [activeTab])

    const handleTableTabChange = useCallback(
        (key: string) =>
            onTableTabInteraction({
                reportName: `${STATS_ROUTES.ANALYTICS_AI_AGENT}/${activeTab}`,
                tableTab: key,
            }),
        [onTableTabInteraction, activeTab],
    )

    const ShoppingAssistantDashboardWithPaywall = useMemo(
        () =>
            SalesPaywallMiddlewareRouter(() => (
                <AiAgentDashboardLayoutRenderer
                    defaultLayoutConfig={
                        ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT
                    }
                    reportConfig={AnalyticsAiAgentShoppingAssistantReportConfig}
                    dashboardId={ManagedDashboardId.AiAgentAnalytics}
                    tabId={ManagedDashboardsTabId.ShoppingAssistant}
                    tabName={AiAgentAnalyticsContent.ShoppingAssistant}
                    onTableTabChange={handleTableTabChange}
                />
            )),
        [handleTableTabChange],
    )

    const { value: isFiltersEnabled, isLoading: isFiltersFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsFilters)

    const optionalFilters = useMemo(
        () =>
            !isFiltersFFLoading && isFiltersEnabled
                ? activeTabConfig.reportConfig.reportFilters.optional
                : [],
        [activeTabConfig, isFiltersEnabled, isFiltersFFLoading],
    )

    const { statsFilters } = useAiAgentStatsFilters()
    const isStoresComingSoon = isPeriodBeforeDate({
        period: statsFilters.period,
        date: STORES_FILTER_AVAILABILITY_DATE,
    })

    const renderDashboard = useMemo(() => {
        switch (activeTab) {
            case AiAgentAnalyticsQueryParams.AllAgents:
                return (
                    <AiAgentDashboardLayoutRenderer
                        defaultLayoutConfig={
                            ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT
                        }
                        reportConfig={AnalyticsAiAgentAllAgentsReportConfig}
                        dashboardId={ManagedDashboardId.AiAgentAnalytics}
                        tabId={ManagedDashboardsTabId.AllAgents}
                        tabName={AiAgentAnalyticsContent.AllAgents}
                        onTableTabChange={handleTableTabChange}
                    />
                )
            case AiAgentAnalyticsQueryParams.SupportAgent:
                return (
                    <AiAgentDashboardLayoutRenderer
                        defaultLayoutConfig={
                            ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT
                        }
                        reportConfig={AnalyticsAiAgentSupportAgentReportConfig}
                        dashboardId={ManagedDashboardId.AiAgentAnalytics}
                        tabId={ManagedDashboardsTabId.SupportAgent}
                        tabName={AiAgentAnalyticsContent.SupportAgent}
                        onTableTabChange={handleTableTabChange}
                    />
                )
            case AiAgentAnalyticsQueryParams.ShoppingAssistant:
                return <ShoppingAssistantDashboardWithPaywall />
            default:
                return null
        }
    }, [activeTab, handleTableTabChange, ShoppingAssistantDashboardWithPaywall])

    const handleTabChangeCallback = ({
        tabParam,
        previousTab,
    }: {
        tabParam: string
        previousTab: string | null
    }) => {
        onAnalyticsAiAgentTabSelected({
            tabName: tabParam,
            previousTab: previousTab ?? AiAgentAnalyticsQueryParams.AllAgents,
        })
    }

    const paywallHidden =
        canUseAiSalesAgent ||
        activeTab !== AiAgentAnalyticsQueryParams.ShoppingAssistant

    return (
        <AnalyticsPage
            ref={contentRef}
            title="AI Agent"
            titleExtra={
                paywallHidden ? (
                    <DashboardExportButton
                        key={activeTab}
                        contentRef={contentRef}
                        useCsvExport={useCsvExport}
                        pdfFileName={`ai-agent-${activeTab}`}
                        onExport={(format) =>
                            onExport({
                                format,
                            })
                        }
                    />
                ) : (
                    <Box height="32px" />
                )
            }
            tabs={HEADER_NAVBAR_ITEMS}
            tabParamName={AI_AGENT_TAB_PARAM}
            activeTab={activeTab}
            defaultTab={AiAgentAnalyticsQueryParams.AllAgents}
            onTabChangeCallback={handleTabChangeCallback}
            filtersSlot={
                paywallHidden ? (
                    <Box padding="lg" paddingBottom="0px">
                        <FiltersPanelWrapper
                            persistentFilters={
                                activeTabConfig.reportConfig.reportFilters
                                    .persistent
                            }
                            withSavedFilters={false}
                            optionalFilters={optionalFilters}
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        maxSpan: 365,
                                        minDate: moment(
                                            MIN_DATE_FOR_AI_AGENT,
                                            'YYYY-MM-DD',
                                        ).toDate(),
                                    },
                                },
                                ...(isStoresComingSoon && {
                                    [FilterKey.Stores]: {
                                        isDisabled: true,
                                        warningMessage: `The store filter will be available in AI Agent ${activeTabConfig.title} starting August 1, 2025.`,
                                    },
                                }),
                            }}
                            compact
                        />
                    </Box>
                ) : null
            }
        >
            {renderDashboard}
        </AnalyticsPage>
    )
}
