import { useState } from 'react'

import { Box, ButtonGroup, ButtonGroupItem, Heading } from '@gorgias/axiom'

import { AiAgentAnalyticsQueryParams } from 'pages/aiAgent/analyticsAiAgent/constants'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { STATS_ROUTES } from 'routes/constants'

import { ShoppingAssistantChannelTable } from './ShoppingAssistantChannelTable'
import { ShoppingAssistantTopProductsTable } from './ShoppingAssistantTopProductsTable'

import css from './PerformanceBreakdownTable.less'

const PerformanceTab = {
    channel: 'Channel',
    topProductRecommended: 'Top products recommended',
}

type PerformanceTabKey = keyof typeof PerformanceTab

export const ShoppingAssistantPerformanceBreakdownTable = () => {
    const [activeTab, setActiveTab] = useState<string>('channel')
    const { onTableTabInteraction } = useAiAgentAnalyticsDashboardTracking()

    const handleSelectionChange = (key: PerformanceTabKey) => {
        onTableTabInteraction({
            reportName: `${STATS_ROUTES.ANALYTICS_AI_AGENT}/${AiAgentAnalyticsQueryParams.ShoppingAssistant}`,
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
                <ButtonGroupItem id="channel">
                    {PerformanceTab.channel}
                </ButtonGroupItem>
                <ButtonGroupItem id="top-products-recommended">
                    {PerformanceTab.topProductRecommended}
                </ButtonGroupItem>
            </ButtonGroup>
            <Box
                className={css.tableContainer}
                display="flex"
                flexDirection="column"
                minWidth="0px"
            >
                {activeTab === 'channel' && <ShoppingAssistantChannelTable />}
                {activeTab === 'top-products-recommended' && (
                    <ShoppingAssistantTopProductsTable />
                )}
            </Box>
        </Box>
    )
}
