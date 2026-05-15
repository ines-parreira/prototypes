import { useMemo, useState } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, ButtonGroup, ButtonGroupItem, Heading } from '@gorgias/axiom'

import { useSaveSelectedTable } from 'domains/reporting/hooks/managed-dashboards/useSaveSelectedTable'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { useIsArticleRecommendationTableVisible } from 'pages/aiAgent/analyticsOverview/hooks/useIsArticleRecommendationTableVisible'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutSection,
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

import css from './TablesSection.less'

type TablesSectionProps = {
    section: LayoutSection
    reportConfig: ReportConfig<AnalyticsChartType>
    dashboardId?: ManagedDashboardId
    layoutConfig?: DashboardLayoutConfig
    tabId?: ManagedDashboardsTabId
    tabName?: string
    onTabChange?: (key: ManagedDashboardsTabId) => void
}

function getSelectedTableIdFromVisibility(items: LayoutSection['items']) {
    return items.find((item) => item.visibility)?.chartId ?? ''
}

function getActiveTableId({
    items,
    isPersistenceEnabled,
    persistedSelectedId,
    localSelectedId,
}: {
    items: LayoutSection['items']
    isPersistenceEnabled: boolean
    persistedSelectedId: string
    localSelectedId: string | null
}) {
    const fallbackTableId = items[0]?.chartId || ''

    if (isPersistenceEnabled) {
        return persistedSelectedId || fallbackTableId
    }

    if (
        localSelectedId &&
        items.some((item) => item.chartId === localSelectedId)
    ) {
        return localSelectedId
    }

    return fallbackTableId
}

export const TablesSection = ({
    section,
    reportConfig,
    dashboardId,
    layoutConfig,
    tabId,
    tabName,
    onTabChange,
}: TablesSectionProps) => {
    const { value: isAnalyticsDashboardsTablesEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )
    const { value: isCustomDashboardsEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsCustomDashboards,
    )
    const isArticleRecommendationTableVisible =
        useIsArticleRecommendationTableVisible()

    const availableItems = section.items.filter(
        (item) =>
            (!item.requiresFeatureFlag || isAnalyticsDashboardsTablesEnabled) &&
            (item.chartId !==
                AnalyticsOverviewChart.ArticleRecommendationTable ||
                isArticleRecommendationTableVisible),
    )

    const selectedTableId = useMemo(
        () => getSelectedTableIdFromVisibility(availableItems),
        [availableItems],
    )

    const { onSelect: saveSelectedTable } = useSaveSelectedTable({
        dashboardId,
        tabId,
        tabName,
        layoutConfig: layoutConfig ?? { sections: [section] },
    })
    const [localActiveTableId, setLocalActiveTableId] = useState<string | null>(
        null,
    )

    const activeTableId = useMemo(() => {
        return getActiveTableId({
            items: availableItems,
            isPersistenceEnabled: isAnalyticsDashboardsTablesEnabled,
            persistedSelectedId: selectedTableId,
            localSelectedId: localActiveTableId,
        })
    }, [
        availableItems,
        isAnalyticsDashboardsTablesEnabled,
        localActiveTableId,
        selectedTableId,
    ])

    if (availableItems.length === 0) {
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
            {availableItems.length > 1 && (
                <ButtonGroup
                    selectedKey={activeTableId}
                    onSelectionChange={(key: string) => {
                        if (isAnalyticsDashboardsTablesEnabled) {
                            saveSelectedTable(key)
                        } else {
                            setLocalActiveTableId(key)
                        }
                        onTabChange?.(key as ManagedDashboardsTabId)
                    }}
                >
                    {availableItems.map((item) => (
                        <ButtonGroupItem key={item.chartId} id={item.chartId}>
                            {reportConfig.charts[item.chartId].label}
                        </ButtonGroupItem>
                    ))}
                </ButtonGroup>
            )}
            {availableItems
                .filter((item) => activeTableId === item.chartId)
                .map((item) => (
                    <Box key={item.chartId} width="100%" minWidth="0px">
                        <DashboardComponent
                            chart={item.chartId}
                            config={reportConfig}
                            withChartMenu={isCustomDashboardsEnabled}
                        />
                    </Box>
                ))}
        </Box>
    )
}
