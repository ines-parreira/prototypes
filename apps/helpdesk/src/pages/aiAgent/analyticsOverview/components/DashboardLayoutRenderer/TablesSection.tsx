import { useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box, ButtonGroup, ButtonGroupItem, Heading } from '@gorgias/axiom'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import type {
    AnalyticsChartType,
    LayoutSection,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

import css from './TablesSection.less'

type TablesSectionProps = {
    section: LayoutSection
    reportConfig: ReportConfig<AnalyticsChartType>
    onTabChange?: (key: ManagedDashboardsTabId) => void
}

export const TablesSection = ({
    section,
    reportConfig,
    onTabChange,
}: TablesSectionProps) => {
    const isAnalyticsDashboardsTablesEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )

    const visibleItems = section.items.filter(
        (item) =>
            !item.requiresFeatureFlag ||
            (item.requiresFeatureFlag && isAnalyticsDashboardsTablesEnabled),
    )

    const [activeTableId, setActiveTableId] = useState<string>(
        visibleItems[0]?.chartId ?? '',
    )

    const hasMultipleTables = visibleItems.length > 1

    if (visibleItems.length === 0) {
        return null
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            flex={1}
            gap="xxxs"
            minWidth="0px"
        >
            {section.tableTitle && (
                <Box className={css.header}>
                    <Heading size="sm" className={css.title}>
                        {section.tableTitle}
                    </Heading>
                </Box>
            )}
            {hasMultipleTables && (
                <ButtonGroup
                    selectedKey={activeTableId}
                    onSelectionChange={(key: string) => {
                        setActiveTableId(key)
                        onTabChange?.(key as ManagedDashboardsTabId)
                    }}
                >
                    {visibleItems.map((item) => (
                        <ButtonGroupItem key={item.chartId} id={item.chartId}>
                            {reportConfig.charts[item.chartId].label}
                        </ButtonGroupItem>
                    ))}
                </ButtonGroup>
            )}
            {visibleItems
                .filter((item) => activeTableId === item.chartId)
                .map((item) => (
                    <Box key={item.chartId} width="100%" minWidth="0px">
                        <DashboardComponent
                            chart={item.chartId}
                            config={reportConfig}
                        />
                    </Box>
                ))}
        </Box>
    )
}
