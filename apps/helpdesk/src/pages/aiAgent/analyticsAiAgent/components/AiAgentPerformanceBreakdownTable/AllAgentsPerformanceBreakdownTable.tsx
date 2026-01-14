import { useState } from 'react'

import { Box, ButtonGroup, ButtonGroupItem, Heading } from '@gorgias/axiom'

import { AiAgentAnalyticsQueryParams } from 'pages/aiAgent/analyticsAiAgent/constants'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { STATS_ROUTES } from 'routes/constants'

import { ChannelPerformanceBreakdownTable } from './ChannelPerformanceBreakdownTable'
import { IntentPerformanceBreakdownTable } from './IntentPerformanceBreakdownTable'

import css from './PerformanceBreakdownTable.less'

const PerformanceTab = {
    Channel: 'Channel',
    Intent: 'Intent',
} as const

type PerformanceTabKey = keyof typeof PerformanceTab

export const AllAgentsPerformanceBreakdownTable = () => {
    const [activeTab, setActiveTab] = useState<PerformanceTabKey>('Channel')
    const { onTableTabInteraction } = useAiAgentAnalyticsDashboardTracking()

    const handleSelectionChange = (key: PerformanceTabKey) => {
        onTableTabInteraction({
            reportName: `${STATS_ROUTES.ANALYTICS_AI_AGENT}/${AiAgentAnalyticsQueryParams.AllAgents}`,
            tableTab: key,
        })
        setActiveTab(key)
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            flex={1}
            gap="xxxs"
            minWidth="0px"
        >
            <Box className={css.header}>
                <Heading size="sm" className={css.title}>
                    Performance breakdown
                </Heading>
            </Box>
            <ButtonGroup
                selectedKey={activeTab}
                onSelectionChange={(key) =>
                    handleSelectionChange(key as PerformanceTabKey)
                }
            >
                <ButtonGroupItem id="Channel">
                    {PerformanceTab.Channel}
                </ButtonGroupItem>
                <ButtonGroupItem id="Intent">
                    {PerformanceTab.Intent}
                </ButtonGroupItem>
            </ButtonGroup>
            {activeTab === 'Channel' ? (
                <ChannelPerformanceBreakdownTable />
            ) : (
                <IntentPerformanceBreakdownTable />
            )}
        </Box>
    )
}
