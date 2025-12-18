import { useMemo, useRef } from 'react'

import { useHistory, useLocation } from 'react-router'

import { Box, Heading, TabItem, TabList, Tabs } from '@gorgias/axiom'

import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { useSearchParam } from 'hooks/useSearchParam'
import { AnalyticsOverviewDownloadButton } from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewDownloadButton/AnalyticsOverviewDownloadButton'
import { DashboardLayoutRenderer } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer'

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

import css from './AnalyticsAiAgentLayout.less'

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
    const location = useLocation()
    const history = useHistory()
    const dashboardRef = useRef<HTMLDivElement>(null)

    const [aiagentTab] = useSearchParam(AI_AGENT_TAB_PARAM)

    const activeTab = aiagentTab || AiAgentAnalyticsQueryParams.AllAgents

    const activeTabConfig = useMemo(() => {
        return (
            HEADER_NAVBAR_ITEMS.find((item) => item.param === activeTab) ||
            HEADER_NAVBAR_ITEMS[0]
        )
    }, [activeTab])

    const renderDashboard = useMemo(() => {
        switch (activeTab) {
            case AiAgentAnalyticsQueryParams.AllAgents:
                return (
                    <DashboardLayoutRenderer
                        layoutConfig={ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT}
                        reportConfig={AnalyticsAiAgentAllAgentsReportConfig}
                    />
                )
            case AiAgentAnalyticsQueryParams.SupportAgent:
                return (
                    <DashboardLayoutRenderer
                        layoutConfig={ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT}
                        reportConfig={AnalyticsAiAgentSupportAgentReportConfig}
                    />
                )
            case AiAgentAnalyticsQueryParams.ShoppingAssistant:
                return (
                    <DashboardLayoutRenderer
                        layoutConfig={
                            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT
                        }
                        reportConfig={
                            AnalyticsAiAgentShoppingAssistantReportConfig
                        }
                    />
                )
            default:
                return null
        }
    }, [activeTab])

    const onTabChange = (tabParam: string | number) => {
        const searchParams = new URLSearchParams(location.search)
        searchParams.set(AI_AGENT_TAB_PARAM, tabParam.toString())

        history.replace({
            pathname: location.pathname,
            search: searchParams.toString(),
        })
    }

    return (
        <Box display="flex" flexDirection="column" flex={1} minWidth="0px">
            <Box
                flexDirection="column"
                justifyContent="space-between"
                className={css.stickyHeader}
            >
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    padding="lg"
                >
                    <Heading size="lg">AI Agent</Heading>
                    <AnalyticsOverviewDownloadButton
                        dashboardRef={dashboardRef}
                    />
                </Box>
                <Box width="100%" display="flex" flexDirection="column">
                    <Tabs
                        selectedItem={activeTab}
                        onSelectionChange={onTabChange}
                    >
                        <TabList>
                            {HEADER_NAVBAR_ITEMS.map(({ param, title }) => (
                                <TabItem key={param} id={param} label={title} />
                            ))}
                        </TabList>
                    </Tabs>
                </Box>
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
                    />
                </Box>
            </Box>
            <Box
                ref={dashboardRef}
                display="flex"
                flexDirection="column"
                flex={1}
                minWidth="0px"
            >
                {renderDashboard}
            </Box>
        </Box>
    )
}
