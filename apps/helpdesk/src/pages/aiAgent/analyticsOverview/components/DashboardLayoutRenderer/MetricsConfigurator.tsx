import { useState } from 'react'

import { ConfigureMetricsModal } from '@repo/reporting'
import type { MetricConfigItem } from '@repo/reporting'

import { Box, Button } from '@gorgias/axiom'

import { useUpdateManagedDashboard } from 'domains/reporting/hooks/managed-dashboards/useUpdateManagedDashboard'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type MetricsConfiguratorProps = {
    metrics: MetricConfigItem[]
    dashboardId: string
    currentLayoutConfig: DashboardLayoutConfig
}

export const MetricsConfigurator = ({
    metrics,
    dashboardId,
    currentLayoutConfig,
}: MetricsConfiguratorProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const { updateSection, isLoading } = useUpdateManagedDashboard()

    const handleSave = (updatedMetrics: MetricConfigItem[]) => {
        const kpisSectionId =
            currentLayoutConfig.sections.find((s) => s.type === 'kpis')?.id ??
            'section_kpis'

        updateSection(
            dashboardId,
            currentLayoutConfig,
            kpisSectionId,
            (section) => ({
                ...section,
                items: updatedMetrics.map((metric) => {
                    const existingItem = section.items.find(
                        (item) => item.chartId === metric.id,
                    )
                    return {
                        chartId: metric.id as AnalyticsChartType,
                        gridSize: existingItem?.gridSize ?? 3,
                        visibility: metric.visibility,
                        requiresFeatureFlag:
                            !!existingItem?.requiresFeatureFlag,
                    }
                }),
            }),
            () => setIsEditModalOpen(false),
        )
    }

    return (
        <Box alignItems="center" gap="sm" justifyContent="flex-end" flex={1}>
            <Button
                key="settings"
                size="sm"
                variant="tertiary"
                leadingSlot="columns"
                onClick={() => setIsEditModalOpen(true)}
            >
                Edit metrics
            </Button>
            <ConfigureMetricsModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                maxVisibleMetric={20}
                metrics={metrics}
                onSave={handleSave}
                isLoading={isLoading}
            />
        </Box>
    )
}
