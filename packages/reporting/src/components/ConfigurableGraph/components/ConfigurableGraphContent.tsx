import { BarChart, DonutChart } from '../../ChartCard'
import type { ChartType } from '../../ChartCard'
import { HorizontalBarChart } from '../../HorizontalBarChart'
import { MultipleTimeSeriesChart } from '../../TimeSeriesChart/MultipleTimeSeriesChart'
import { TimeSeriesChart } from '../../TimeSeriesChart/TimeSeriesChart'
import type { ConfigurableGraphGroupingConfig } from '../types'
import { ConfigurableGraphType } from '../types'

type DonutOrBarWithToggleGroupingConfig = Extract<
    ConfigurableGraphGroupingConfig,
    { configurableGraphType: 'bar' | 'donut' }
>
type TimeSeriesGroupingConfig = Extract<
    ConfigurableGraphGroupingConfig,
    { configurableGraphType: 'timeSeries' }
>
type MultipleTimeSeriesGroupingConfig = Extract<
    ConfigurableGraphGroupingConfig,
    { configurableGraphType: 'multipleTimeSeries' }
>
type HorizontalBarGroupingConfig = Extract<
    ConfigurableGraphGroupingConfig,
    { configurableGraphType: 'horizontal-bar' }
>

// allow in the future a 'donut-or-bar' type
function DonutOrBarWithToggleRenderer({
    groupingConfig,
    activeGraphType,
}: {
    groupingConfig: DonutOrBarWithToggleGroupingConfig
    activeGraphType: ChartType
}) {
    const { data, isLoading } = groupingConfig.useChartData()
    const filteredData = data?.filter((item) => item.value !== 0)

    if (activeGraphType === 'donut') {
        return (
            <DonutChart
                data={filteredData}
                containerHeight={280}
                isLoading={isLoading}
                valueFormatter={groupingConfig.valueFormatter}
                period={groupingConfig.period}
            />
        )
    }

    return (
        <BarChart
            data={filteredData}
            containerHeight={280}
            isLoading={isLoading}
            valueFormatter={groupingConfig.valueFormatter}
            yAxisFormatter={groupingConfig.valueFormatter}
            period={groupingConfig.period}
        />
    )
}

function TimeSeriesRenderer({
    groupingConfig,
}: {
    groupingConfig: TimeSeriesGroupingConfig
}) {
    const { data, isLoading } = groupingConfig.useChartData()

    return (
        <TimeSeriesChart
            data={data ?? []}
            isLoading={isLoading}
            valueFormatter={groupingConfig.valueFormatter}
            yAxisFormatter={groupingConfig.yAxisFormatter}
            dateFormatter={groupingConfig.dateFormatter}
        />
    )
}

function MultipleTimeSeriesRenderer({
    groupingConfig,
}: {
    groupingConfig: MultipleTimeSeriesGroupingConfig
}) {
    const { data, isLoading } = groupingConfig.useChartData()

    return (
        <MultipleTimeSeriesChart
            data={data ?? []}
            isLoading={isLoading}
            valueFormatter={groupingConfig.valueFormatter}
            yAxisFormatter={groupingConfig.yAxisFormatter}
            dateFormatter={groupingConfig.dateFormatter}
        />
    )
}

function HorizontalBarRenderer({
    groupingConfig,
}: {
    groupingConfig: HorizontalBarGroupingConfig
}) {
    const { data, isLoading } = groupingConfig.useChartData()

    return (
        <HorizontalBarChart
            data={data ?? []}
            isLoading={isLoading}
            valueFormatter={groupingConfig.valueFormatter}
            initialItemsCount={groupingConfig.initialItemsCount}
            showExpandButton={groupingConfig.showExpandButton}
            maxExpandedHeight={groupingConfig.maxExpandedHeight}
        />
    )
}

type Props = {
    groupingConfig: ConfigurableGraphGroupingConfig
}

export function ConfigurableGraphContent({ groupingConfig }: Props) {
    switch (groupingConfig.configurableGraphType) {
        case ConfigurableGraphType.Bar:
            return (
                <DonutOrBarWithToggleRenderer
                    groupingConfig={groupingConfig}
                    activeGraphType={ConfigurableGraphType.Bar}
                />
            )
        case ConfigurableGraphType.Donut:
            return (
                <DonutOrBarWithToggleRenderer
                    groupingConfig={groupingConfig}
                    activeGraphType={ConfigurableGraphType.Donut}
                />
            )
        case ConfigurableGraphType.TimeSeries:
            return <TimeSeriesRenderer groupingConfig={groupingConfig} />
        case ConfigurableGraphType.MultipleTimeSeries:
            return (
                <MultipleTimeSeriesRenderer groupingConfig={groupingConfig} />
            )
        case ConfigurableGraphType.HorizontalBar:
            return <HorizontalBarRenderer groupingConfig={groupingConfig} />
    }
}
