import { BarChart, DonutChart } from '../../ChartCard'
import type { ChartType } from '../../ChartCard'
import { HorizontalBarChart } from '../../HorizontalBarChart'
import { TimeSeriesChart } from '../../TimeSeriesChart/TimeSeriesChart'
import type { ConfigurableGraphGroupingConfig } from '../types'
import { ConfigurableGraphType } from '../types'

type DonutOrBarWithToggleGroupingConfig = Extract<
    ConfigurableGraphGroupingConfig,
    { chartType: 'bar' | 'donut' }
>
type LineGroupingConfig = Extract<
    ConfigurableGraphGroupingConfig,
    { chartType: 'line' }
>
type HorizontalBarGroupingConfig = Extract<
    ConfigurableGraphGroupingConfig,
    { chartType: 'horizontal-bar' }
>

// allow in the future a 'donut-or-bar' type
function DonutOrBarWithToggleRenderer({
    groupingConfig,
    activeChartType,
}: {
    groupingConfig: DonutOrBarWithToggleGroupingConfig
    activeChartType: ChartType
}) {
    const { data, isLoading } = groupingConfig.useChartData()
    const filteredData = data?.filter((item) => item.value !== 0)

    if (activeChartType === 'donut') {
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
            period={groupingConfig.period}
        />
    )
}

function LineRenderer({
    groupingConfig,
}: {
    groupingConfig: LineGroupingConfig
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
    switch (groupingConfig.chartType) {
        case ConfigurableGraphType.Bar:
            return (
                <DonutOrBarWithToggleRenderer
                    groupingConfig={groupingConfig}
                    activeChartType={ConfigurableGraphType.Bar}
                />
            )
        case ConfigurableGraphType.Donut:
            return (
                <DonutOrBarWithToggleRenderer
                    groupingConfig={groupingConfig}
                    activeChartType={ConfigurableGraphType.Donut}
                />
            )
        case ConfigurableGraphType.Line:
            return <LineRenderer groupingConfig={groupingConfig} />
        case ConfigurableGraphType.HorizontalBar:
            return <HorizontalBarRenderer groupingConfig={groupingConfig} />
    }
}
