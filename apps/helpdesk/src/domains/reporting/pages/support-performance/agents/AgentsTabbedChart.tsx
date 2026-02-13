import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory, useLocation } from 'react-router-dom'

import type { TabsProps } from '@gorgias/axiom'
import { Box, TabItem, TabList, Tabs } from '@gorgias/axiom'

import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AgentAvailabilityTable } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTable'
import { AgentsPerformanceCardExtra } from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra'
import { AgentsTableWithDefaultState } from 'domains/reporting/pages/support-performance/agents/AgentsTable'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'

enum AgentTab {
    Performance = 'performance',
    Availability = 'availability',
}

export const AgentsTabbedChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const isAgentAvailabilityEnabled = useFlag(
        FeatureFlagKey.CustomAgentUnavailableStatuses,
    )
    const history = useHistory()
    const location = useLocation()

    const currentTab = useMemo(
        () =>
            location.pathname.includes('/availability')
                ? AgentTab.Availability
                : AgentTab.Performance,
        [location.pathname],
    )

    const handleTabChange = useCallback<
        NonNullable<TabsProps['onSelectionChange']>
    >(
        (tab) => {
            const baseUrl = location.pathname.replace(
                /\/(performance|availability)$/,
                '',
            )
            const newPath = `${baseUrl}/${tab}`
            history.push(newPath)
        },
        [history, location],
    )

    const renderTab = useCallback(() => {
        switch (currentTab) {
            case AgentTab.Performance:
                return <AgentsTableWithDefaultState />
            case AgentTab.Availability:
                return <AgentAvailabilityTable />
            default:
                return null
        }
    }, [currentTab])

    // Determine title and titleExtra based on current tab
    const title =
        currentTab === AgentTab.Performance
            ? SECTION_TITLES.AGENT_PERFORMANCE
            : SECTION_TITLES.AGENT_AVAILABILITY

    if (!isAgentAvailabilityEnabled) {
        return (
            <ChartCard
                title={SECTION_TITLES.AGENT_PERFORMANCE}
                titleExtra={<AgentsPerformanceCardExtra />}
                chartId={chartId}
                dashboard={dashboard}
                noPadding
            >
                <AgentsTableWithDefaultState />
            </ChartCard>
        )
    }

    return (
        <ChartCard
            title={title}
            titleExtra={<AgentsPerformanceCardExtra />}
            headerSlot={
                <Box paddingTop="lg">
                    <Tabs
                        selectedItem={currentTab}
                        onSelectionChange={handleTabChange}
                    >
                        <TabList>
                            <TabItem
                                id={AgentTab.Performance}
                                label="Agent Performance"
                            />
                            <TabItem
                                id={AgentTab.Availability}
                                label="Agent Availability"
                            />
                        </TabList>
                    </Tabs>
                </Box>
            }
            chartId={chartId}
            dashboard={dashboard}
            noPadding
        >
            {renderTab()}
        </ChartCard>
    )
}
