import { useState } from 'react'

import { Box, Button } from '@gorgias/axiom'

import { ConfigureMetricsModal } from '../ConfigureMetricsModal'
import type { MetricConfigItem } from '../ConfigureMetricsModal'
import { useUpdateManagedDashboard } from './hooks/useUpdateManagedDashboard'
import type { DashboardLayoutConfig } from './types'
import { ChartType } from './types'

type MetricsConfiguratorProps<TChart extends string> = {
    metrics: MetricConfigItem[]
    dashboardId: string
    currentLayoutConfig: DashboardLayoutConfig<TChart>
    tabId: string
    tabName: string
}

export function MetricsConfigurator<TChart extends string>({
    metrics,
    dashboardId,
    currentLayoutConfig,
    tabId,
    tabName,
}: MetricsConfiguratorProps<TChart>) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const { updateSection, isLoading } = useUpdateManagedDashboard()

    const handleSave = (updatedMetrics: MetricConfigItem[]) => {
        const kpisSectionId =
            currentLayoutConfig.sections.find(
                (s) =>
                    s.type === ChartType.Card ||
                    s.type === ChartType.CardWithTimeseries,
            )?.id ?? 'section_kpis'

        updateSection(
            dashboardId,
            tabId,
            tabName,
            currentLayoutConfig,
            kpisSectionId,
            (section) => ({
                ...section,
                items: updatedMetrics.map((metric) => {
                    const existingItem = section.items.find(
                        (item) => item.chartId === metric.id,
                    )
                    return {
                        chartId: metric.id as TChart,
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
                description={
                    'Choose which metrics to display and rearrange them as needed.'
                }
            />
        </Box>
    )
}
