import { useMemo, useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { getPreviousUrl } from '@repo/routing'

import { Box } from '@gorgias/axiom'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { AnalyticsPage } from 'domains/reporting/pages/common/layout/AnalyticsPage'
import { useSearchParam } from 'hooks/useSearchParam'
import { AnalyticsOverviewDownloadButton } from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewDownloadButton/AnalyticsOverviewDownloadButton'
import { DashboardLayoutRenderer } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer'
import { ManagedDashboardId } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
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
    const { onAnalyticsReportViewed, onAnalyticsAiAgentTabSelected } =
        useAiAgentAnalyticsDashboardTracking()

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

    const renderDashboard = useMemo(() => {
        switch (activeTab) {
            case AiAgentAnalyticsQueryParams.AllAgents:
                return (
                    <DashboardLayoutRenderer
                        defaultLayoutConfig={
                            ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT
                        }
                        reportConfig={AnalyticsAiAgentAllAgentsReportConfig}
                        tabKey={AiAgentAnalyticsQueryParams.AllAgents}
                        dashboardId={ManagedDashboardId.AiAgentAllAgents}
                    />
                )
            case AiAgentAnalyticsQueryParams.SupportAgent:
                return (
                    <DashboardLayoutRenderer
                        defaultLayoutConfig={
                            ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT
                        }
                        reportConfig={AnalyticsAiAgentSupportAgentReportConfig}
                        tabKey={AiAgentAnalyticsQueryParams.SupportAgent}
                        dashboardId={ManagedDashboardId.AiAgentSupportAgent}
                    />
                )
            case AiAgentAnalyticsQueryParams.ShoppingAssistant:
                return (
                    <DashboardLayoutRenderer
                        defaultLayoutConfig={
                            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT
                        }
                        reportConfig={
                            AnalyticsAiAgentShoppingAssistantReportConfig
                        }
                        tabKey={AiAgentAnalyticsQueryParams.ShoppingAssistant}
                        dashboardId={
                            ManagedDashboardId.AiAgentShoppingAssistant
                        }
                    />
                )
            default:
                return null
        }
    }, [activeTab])

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

    return (
        <AnalyticsPage
            ref={contentRef}
            title="AI Agent"
            titleExtra={
                <AnalyticsOverviewDownloadButton
                    key={activeTab}
                    contentRef={contentRef}
                    useCsvExport={useCsvExport}
                    pdfFileName={`ai-agent-${activeTab}`}
                />
            }
            tabs={HEADER_NAVBAR_ITEMS}
            tabParamName={AI_AGENT_TAB_PARAM}
            activeTab={activeTab}
            defaultTab={AiAgentAnalyticsQueryParams.AllAgents}
            onTabChangeCallback={handleTabChangeCallback}
            filtersSlot={
                <Box padding="lg" paddingBottom="0px">
                    <FiltersPanelWrapper
                        persistentFilters={
                            activeTabConfig.reportConfig.reportFilters
                                .persistent
                        }
                        withSavedFilters={false}
                        optionalFilters={[]}
                        filterSettingsOverrides={{
                            [FilterKey.Period]: {
                                initialSettings: {
                                    maxSpan: 365,
                                },
                            },
                        }}
                        compact
                    />
                </Box>
            }
        >
            {renderDashboard}
        </AnalyticsPage>
    )
}
