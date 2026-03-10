import type { ReactNode } from 'react'
import { useState } from 'react'

import type { MetricTrend } from '../../types'
import { ChartCard } from '../ChartCard'
import { ConfigurableGraphContent } from './components/ConfigurableGraphContent'
import { MetricGroupingSelect } from './components/MetricGroupingSelect'
import type {
    ConfigurableGraphGroupingConfig,
    ConfigurableGraphMetricConfig,
} from './types'

export type { ConfigurableGraphGroupingConfig, ConfigurableGraphMetricConfig }

type Selection = {
    metricId: string
    groupingId: string
}

type Props = {
    metrics: ConfigurableGraphMetricConfig[]
    onSelect?: (selection: Selection) => void
    actionMenu?: ReactNode
}

const NO_TREND: MetricTrend = { isFetching: false, isError: false }
const useNoTrendData = () => NO_TREND

export function ConfigurableGraph({ metrics, onSelect, actionMenu }: Props) {
    const [selectedMetricId, setSelectedMetricId] = useState(metrics[0].id)
    const [selectedGroupingId, setSelectedGroupingId] = useState(
        metrics[0].groupings[0].id,
    )

    const selectedMetric = metrics.find((m) => m.id === selectedMetricId)!
    const selectedGrouping = selectedMetric.groupings.find(
        (g) => g.id === selectedGroupingId,
    )!

    const hasTrend = Boolean(selectedMetric.useTrendData)
    const trendData = (selectedMetric.useTrendData ?? useNoTrendData)()

    const handleMetricChange = (metricId: string) => {
        const newMetric = metrics.find((m) => m.id === metricId)!
        const groupingId = newMetric.groupings[0].id
        setSelectedMetricId(metricId)
        setSelectedGroupingId(groupingId)
        onSelect?.({ metricId, groupingId })
    }

    const handleGroupingChange = (groupingId: string) => {
        setSelectedGroupingId(groupingId)
        onSelect?.({ metricId: selectedMetricId, groupingId })
    }

    const chartControls = (
        <>
            {selectedMetric.groupings.length > 1 && (
                <MetricGroupingSelect
                    items={selectedMetric.groupings}
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
            metrics={metrics.map((m) => ({ id: m.id, label: m.name }))}
            onMetricChange={(label) => {
                const metric = metrics.find((m) => m.name === label)
                if (metric) handleMetricChange(metric.id)
            }}
            chartControls={chartControls}
            alwaysShowChartControls={true}
            value={hasTrend ? (trendData.data?.value ?? undefined) : undefined}
            prevValue={
                hasTrend ? (trendData.data?.prevValue ?? undefined) : undefined
            }
            metricFormat={hasTrend ? selectedMetric.metricFormat : undefined}
            interpretAs={hasTrend ? selectedMetric.interpretAs : undefined}
            tooltipData={selectedMetric.tooltipData}
            isLoading={trendData.isFetching}
        >
            <ConfigurableGraphContent groupingConfig={selectedGrouping} />
        </ChartCard>
    )
}
