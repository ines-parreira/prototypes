import { ConfigurableGraphType } from '@repo/reporting'
import type {
    ConfigurableGraphGroupingConfig,
    ConfigurableGraphMetricConfig,
    MetricTrendFormat,
    SankeyChartData,
} from '@repo/reporting'

import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { buildBarCsvFiles } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import type { DimensionBreakdownFactory } from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import {
    fetchStatsMetricBreakdownPerDimension,
    useStatsMetricBreakdownPerDimension,
} from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import type { DimensionName } from 'domains/reporting/models/scopes/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatPeriod,
    toChartData,
} from 'domains/reporting/utils/configurableChartUtils/formatters'

// Generic, page-agnostic configuration for a bar chart that breaks a metric
// down by one or more dimensions. The dimension is the only configurable type:
// callers specialize `TDimension`, provide a matching `BarChartDimensionDefinition`
// registry, and the metrics' `queryFactory` is enforced to support those dimensions.
export type BarChartBreakdownMetricConfig<TDimension extends DimensionName> = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    dimensions: TDimension[]
    queryFactory: DimensionBreakdownFactory<TDimension>
}

type SankeyGroupingConfig = Extract<
    ConfigurableGraphGroupingConfig,
    { configurableGraphType: 'sankey' }
>

type SankeyDisplayProps = Omit<
    SankeyGroupingConfig,
    'id' | 'name' | 'configurableGraphType' | 'useChartData'
>

// A funnel (Sankey) metric isn't a dimension breakdown: it renders from a single
// stats value query and exports as flat metric/value rows. The page supplies both
// the rendering hook and the imperative export fetch over the same query, so the
// generic config can drive the chart and its CSV the same way it does bar charts.
export type BarChartSankeyMetricConfig = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    sankey: {
        dimensionId: string
        dimensionName: string
        useChartData: (
            filters: StatsFilters,
            timezone: string,
        ) => { data: SankeyChartData; isLoading: boolean }
        fetchExportRows: (
            filters: StatsFilters,
            timezone: string,
        ) => Promise<{ name: string; value: number | null }[]>
        csvMetricName: string
        csvDimensionName: string
        displayProps?: SankeyDisplayProps
    }
}

export type BarChartMetricConfig<TDimension extends DimensionName> =
    | BarChartBreakdownMetricConfig<TDimension>
    | BarChartSankeyMetricConfig

const isSankeyMetric = <TDimension extends DimensionName>(
    metric: BarChartMetricConfig<TDimension>,
): metric is BarChartSankeyMetricConfig => 'sankey' in metric

export type BarChartDimensionDefinition = {
    label: string
    graphType:
        | ConfigurableGraphType.Bar
        | ConfigurableGraphType.Donut
        | ConfigurableGraphType.HorizontalBar
    formatName: (value: string) => string
}

const resolveDimension = <TDimension extends DimensionName>(
    metric: BarChartBreakdownMetricConfig<TDimension>,
    savedDimension: string | null | undefined,
): TDimension =>
    metric.dimensions.find((dimension) => dimension === savedDimension) ??
    metric.dimensions[0]

export const getBarChartGraphConfig = <TDimension extends DimensionName>(
    metrics: BarChartMetricConfig<TDimension>[],
    dimensionDefinitions: Record<TDimension, BarChartDimensionDefinition>,
    statsFilters: StatsFilters,
    timezone: string,
): ConfigurableGraphMetricConfig[] => {
    const period = formatPeriod(statsFilters)

    return metrics.map((metric) => {
        if (isSankeyMetric(metric)) {
            const { sankey } = metric

            return {
                measure: metric.measure,
                name: metric.name,
                metricFormat: metric.metricFormat,
                dimensions: [
                    {
                        id: sankey.dimensionId,
                        name: sankey.dimensionName,
                        configurableGraphType: ConfigurableGraphType.Sankey,
                        useChartData: () =>
                            sankey.useChartData(statsFilters, timezone),
                        ...sankey.displayProps,
                    },
                ],
            }
        }

        return {
            measure: metric.measure,
            name: metric.name,
            metricFormat: metric.metricFormat,
            dimensions: metric.dimensions.map((dimension) => {
                const { label, graphType, formatName } =
                    dimensionDefinitions[dimension]

                return {
                    id: dimension,
                    name: label,
                    configurableGraphType: graphType,
                    useChartData: () =>
                        toChartData(
                            useStatsMetricBreakdownPerDimension(
                                metric.queryFactory,
                                statsFilters,
                                timezone,
                                dimension,
                            ),
                            formatName,
                        ),
                    period,
                }
            }),
        }
    })
}

export const createBarChartFetch =
    <TDimension extends DimensionName>(
        metrics: BarChartMetricConfig<TDimension>[],
        dimensionDefinitions: Record<TDimension, BarChartDimensionDefinition>,
    ): ConfigurableGraphFetch =>
    async (savedMeasure, savedDimension, filters, timezone) => {
        const metric =
            metrics.find((m) => m.measure === savedMeasure) ?? metrics[0]
        if (!metric) {
            return { files: {} }
        }

        if (isSankeyMetric(metric)) {
            const rows = await metric.sankey.fetchExportRows(filters, timezone)

            return {
                files: buildBarCsvFiles(
                    rows,
                    metric.sankey.csvMetricName,
                    metric.sankey.csvDimensionName,
                    metric.metricFormat,
                    filters.period,
                ),
            }
        }

        const dimension = resolveDimension(metric, savedDimension)
        const { label, formatName } = dimensionDefinitions[dimension]

        const result = await fetchStatsMetricBreakdownPerDimension(
            metric.queryFactory,
            filters,
            timezone,
            dimension,
        )

        return {
            files: buildBarCsvFiles(
                toChartData(result, formatName).data,
                metric.name,
                label,
                metric.metricFormat,
                filters.period,
            ),
        }
    }
