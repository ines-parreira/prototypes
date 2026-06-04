import type {
    ConfigurableGraphGroupingConfig,
    ConfigurableGraphMetricConfig,
    MetricTrendFormat,
} from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'

import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import {
    buildMultipleTimeSeriesCsvFiles,
    buildTimeSeriesCsvFiles,
} from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import type { TimeSeriesFactory } from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import {
    fetchStatsMetricTimeSeries,
    fetchStatsMetricTimeSeriesPerDimension,
    useStatsMetricTimeSeries,
    useStatsMetricTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import type { DimensionName } from 'domains/reporting/models/scopes/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import {
    toMultipleTimeSeriesData,
    toTimeSeriesData,
} from 'domains/reporting/utils/configurableChartUtils/formatters'

// The synthetic "no breakdown" dimension: a single line plotting the metric over
// time. It is not a real scope dimension, so it is modelled separately from the
// breakdown dimensions (`TDimension`) the metric's `queryFactory` supports.
export const OVERALL_DIMENSION = 'overall'
export type OverallDimension = typeof OVERALL_DIMENSION

export type LineChartDimension<TDimension extends DimensionName> =
    | OverallDimension
    | TDimension

// Generic, page-agnostic configuration for a line chart that plots a metric over
// time. Each listed dimension renders either a single timeseries line (the
// synthetic `overall` dimension) or one line per dimension value (a real
// breakdown dimension). Callers specialize `TDimension`, provide a matching
// `LineChartDimensionDefinition` registry, and the metric's `queryFactory` is
// enforced to support those breakdown dimensions.
// There is no `interpretAs`: line charts do not render a trend, so no
// good/bad direction is needed.
export type LineChartMetricConfig<TDimension extends DimensionName> = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    dimensions: LineChartDimension<TDimension>[]
    queryFactory: TimeSeriesFactory<TDimension>
}

export type LineChartDimensionDefinition = {
    label: string
    formatName: (value: string) => string
}

const resolveDimension = <TDimension extends DimensionName>(
    metric: LineChartMetricConfig<TDimension>,
    savedDimension: string | null | undefined,
): LineChartDimension<TDimension> =>
    metric.dimensions.find((dimension) => dimension === savedDimension) ??
    metric.dimensions[0]

export const getLineChartGraphConfig = <TDimension extends DimensionName>(
    metrics: LineChartMetricConfig<TDimension>[],
    dimensionDefinitions: Record<
        LineChartDimension<TDimension>,
        LineChartDimensionDefinition
    >,
    statsFilters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): ConfigurableGraphMetricConfig[] =>
    metrics.map((metric) => ({
        measure: metric.measure,
        name: metric.name,
        metricFormat: metric.metricFormat,
        dimensions: metric.dimensions.map(
            (dimension): ConfigurableGraphGroupingConfig => {
                const { label } = dimensionDefinitions[dimension]

                if (dimension === OVERALL_DIMENSION) {
                    return {
                        id: dimension,
                        name: label,
                        configurableGraphType: ConfigurableGraphType.TimeSeries,
                        useChartData: () =>
                            toTimeSeriesData(
                                useStatsMetricTimeSeries(
                                    metric.queryFactory,
                                    statsFilters,
                                    timezone,
                                    granularity,
                                ),
                                granularity,
                            ),
                    }
                }

                const { formatName } = dimensionDefinitions[dimension]

                return {
                    id: dimension,
                    name: label,
                    configurableGraphType:
                        ConfigurableGraphType.MultipleTimeSeries,
                    useChartData: () =>
                        toMultipleTimeSeriesData(
                            useStatsMetricTimeSeriesPerDimension(
                                metric.queryFactory,
                                statsFilters,
                                timezone,
                                granularity,
                                dimension,
                            ),
                            formatName,
                            granularity,
                        ),
                }
            },
        ),
    }))

export const createLineChartFetch =
    <TDimension extends DimensionName>(
        metrics: LineChartMetricConfig<TDimension>[],
        dimensionDefinitions: Record<
            LineChartDimension<TDimension>,
            LineChartDimensionDefinition
        >,
    ): ConfigurableGraphFetch =>
    async (savedMeasure, savedDimension, filters, timezone, granularity) => {
        const metric =
            metrics.find((m) => m.measure === savedMeasure) ?? metrics[0]
        if (!metric) {
            return { files: {} }
        }

        const dimension = resolveDimension(metric, savedDimension)
        const { formatName } = dimensionDefinitions[dimension]

        if (dimension === OVERALL_DIMENSION) {
            const data = await fetchStatsMetricTimeSeries(
                metric.queryFactory,
                filters,
                timezone,
                granularity,
            )

            return {
                files: buildTimeSeriesCsvFiles(
                    toTimeSeriesData({ data, isFetching: false }, granularity)
                        .data,
                    metric.name,
                    metric.metricFormat,
                    filters.period,
                ),
            }
        }

        const data = await fetchStatsMetricTimeSeriesPerDimension(
            metric.queryFactory,
            filters,
            timezone,
            granularity,
            dimension,
        )

        return {
            files: buildMultipleTimeSeriesCsvFiles(
                toMultipleTimeSeriesData(
                    { data, isFetching: false },
                    formatName,
                    granularity,
                ).data,
                metric.name,
                metric.metricFormat,
                filters.period,
            ),
        }
    }
