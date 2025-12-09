import { useMemo, useState } from 'react'

import { BarChart, ChartCard, DonutChart } from '@repo/reporting'
import type { ChartDataItem, ChartType } from '@repo/reporting'

import { ButtonGroup, ButtonGroupItem, Icon } from '@gorgias/axiom'

type MetricOption = {
    id: string
    label: string
}

const METRIC_OPTIONS: MetricOption[] = [
    { id: 'automation-rate', label: 'Overall automation rate' },
    { id: 'automation-interactions', label: 'Overall automation interactions' },
    { id: 'cost-saved', label: 'Overall cost saved' },
    { id: 'time-saved', label: 'Overall time saved by agents' },
]

const AUTOMATION_RATE_DATA: ChartDataItem[] = [
    { name: 'AI Agent', value: 18 },
    { name: 'Flows', value: 7 },
    { name: 'Article Recommendation', value: 4 },
    { name: 'Order Management', value: 3 },
]

type AutomationChartProps = {
    value?: string
    trend?: number
}

export const AutomationChart = ({
    value = '32%',
    trend = 2,
}: AutomationChartProps) => {
    const [selectedMetric, setSelectedMetric] = useState<MetricOption>(
        METRIC_OPTIONS[0],
    )
    const [chartType, setChartType] = useState<ChartType>('donut')

    const chartControls = useMemo(
        () => (
            <ButtonGroup
                defaultSelectedKey="donut"
                selectedKey={chartType}
                onSelectionChange={(selectedKey) =>
                    setChartType(selectedKey as ChartType)
                }
            >
                <ButtonGroupItem id="donut" aria-label="Show donut chart">
                    <Icon name="chart-pie" />
                </ButtonGroupItem>
                <ButtonGroupItem id="bar" aria-label="Show bar chart">
                    <Icon name="chart-bar-vertical" />
                </ButtonGroupItem>
            </ButtonGroup>
        ),
        [chartType],
    )
    const isLoading = false

    return (
        <ChartCard
            title={selectedMetric.label}
            value={value}
            trend={trend}
            prevValue={trend > 0 ? 30 : 34}
            interpretAs="more-is-better"
            metrics={METRIC_OPTIONS}
            onMetricChange={(label) => {
                const metric = METRIC_OPTIONS.find((m) => m.label === label)
                if (metric) {
                    setSelectedMetric(metric)
                }
            }}
            chartControls={chartControls}
        >
            {chartType === 'donut' ? (
                <DonutChart
                    data={AUTOMATION_RATE_DATA}
                    containerHeight={320}
                    isLoading={isLoading}
                />
            ) : (
                <BarChart
                    data={AUTOMATION_RATE_DATA}
                    containerHeight={320}
                    isLoading={isLoading}
                />
            )}
        </ChartCard>
    )
}
