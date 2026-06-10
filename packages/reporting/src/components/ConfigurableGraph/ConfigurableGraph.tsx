import type { ReactNode } from 'react'
import { useState } from 'react'

import type { MetricTrend } from '../../types'
import { formatMetricValue } from '../../utils/helpers'
import { ChartCard } from '../ChartCard'
import type { ChartSchemaWithGraphPreferences } from '../ManagedDashboards/hooks/useSyncConfigurableGraphWithDashboard'
import { useSyncConfigurableGraphWithDashboard } from '../ManagedDashboards/hooks/useSyncConfigurableGraphWithDashboard'
import { ConfigurableGraphContent } from './components/ConfigurableGraphContent'
import { MetricGroupingSelect } from './components/MetricGroupingSelect'
import type {
    ConfigurableGraphGroupingConfig,
    ConfigurableGraphMetricConfig,
} from './types'

export type { ConfigurableGraphGroupingConfig, ConfigurableGraphMetricConfig }

type Selection = {
    measure: string
    dimension: string
}

type Props = {
    metrics: ConfigurableGraphMetricConfig[]
    onSelect?: (selection: Selection) => void
    actionMenu?: ReactNode
    initialMeasure?: string
    initialDimension?: string
    customDashboardChartSchema?: ChartSchemaWithGraphPreferences
    /**
     * When provided AND a managed-dashboard context is present, the chart
     * syncs its selected measure/dimension with that context: it reads the
     * saved values on mount and saves any user changes back. Otherwise the
     * chart behaves as a controlled component driven by `initialMeasure` /
     * `initialDimension` and never touches the managed dashboard.
     */
    analyticsChartId?: string
}

const NO_TREND: MetricTrend = { isFetching: false, isError: false }
const useNoTrendData = () => NO_TREND

export function ConfigurableGraph({
    metrics,
    onSelect: callerOnSelect,
    actionMenu,
    initialMeasure: callerInitialMeasure,
    initialDimension: callerInitialDimension,
    customDashboardChartSchema,
    analyticsChartId,
}: Props) {
    const { remountKey, initialMeasure, initialDimension, onSelect } =
        useSyncConfigurableGraphWithDashboard({
            analyticsChartId,
            customDashboardChartSchema,
            initialMeasure: callerInitialMeasure,
            initialDimension: callerInitialDimension,
            onSelect: callerOnSelect,
        })

    return (
        <ConfigurableGraphInner
            key={remountKey}
            metrics={metrics}
            actionMenu={actionMenu}
            onSelect={onSelect}
            initialMeasure={initialMeasure}
            initialDimension={initialDimension}
        />
    )
}

type InnerProps = {
    metrics: ConfigurableGraphMetricConfig[]
    onSelect: (selection: Selection) => void
    actionMenu?: ReactNode
    initialMeasure?: string
    initialDimension?: string
}

function ConfigurableGraphInner({
    metrics,
    onSelect,
    actionMenu,
    initialMeasure,
    initialDimension,
}: InnerProps) {
    const [selectedMeasure, setSelectedMeasure] = useState(
        initialMeasure ?? metrics[0].measure,
    )
    const [selectedDimension, setSelectedDimension] = useState(
        initialDimension ?? metrics[0].dimensions[0].id,
    )

    const selectedMetric =
        metrics.find((m) => m.measure === selectedMeasure) ?? metrics[0]
    const selectedGrouping =
        selectedMetric.dimensions.find((g) => g.id === selectedDimension) ??
        selectedMetric.dimensions[0]

    const hasTrend = Boolean(selectedMetric.useTrendData)
    const trendData = (selectedMetric.useTrendData ?? useNoTrendData)()

    const handleMetricChange = (measure: string) => {
        const newMetric =
            metrics.find((m) => m.measure === measure) ?? metrics[0]
        const dimension = newMetric.dimensions[0].id
        setSelectedMeasure(measure)
        setSelectedDimension(dimension)
        onSelect({ measure, dimension })
    }

    const handleGroupingChange = (dimension: string) => {
        setSelectedDimension(dimension)
        onSelect({ measure: selectedMeasure, dimension })
    }

    const chartControls = (
        <>
            {selectedMetric.dimensions.length > 1 && (
                <MetricGroupingSelect
                    items={selectedMetric.dimensions}
                    selectedItem={selectedGrouping}
                    onMetricGroupingSelect={(item) =>
                        handleGroupingChange(item.id)
                    }
                />
            )}
            {actionMenu}
        </>
    )

    return (
        <ChartCard
            title={selectedMetric.name}
            metrics={metrics.map((m) => ({ id: m.measure, label: m.name }))}
            onMetricChange={(label) => {
                const metric = metrics.find((m) => m.name === label)
                if (metric) handleMetricChange(metric.measure)
            }}
            chartControls={chartControls}
            alwaysShowChartControls={true}
            withTrend={hasTrend}
            value={hasTrend ? (trendData.data?.value ?? undefined) : undefined}
            prevValue={
                hasTrend ? (trendData.data?.prevValue ?? undefined) : undefined
            }
            metricFormat={hasTrend ? selectedMetric.metricFormat : undefined}
            interpretAs={hasTrend ? selectedMetric.interpretAs : undefined}
            tooltipData={selectedMetric.tooltipData}
            isLoading={trendData.isFetching}
        >
            <ConfigurableGraphContent
                groupingConfig={{
                    valueFormatter: (value) =>
                        formatMetricValue(value, selectedMetric.metricFormat),
                    ...selectedGrouping,
                }}
            />
        </ChartCard>
    )
}
