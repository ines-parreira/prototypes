import { useMemo } from 'react'
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceDot,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { Box } from '@gorgias/axiom'

import { TimeSeriesChartSkeleton } from '../TimeSeriesChart/TimeSeriesChartSkeleton'

import { ComposedMetricTimeSeriesChartLegend } from './components/ComposedMetricTimeSeriesChartLegend'
import { renderComposedMetricTimeSeriesTooltipContent } from './components/ComposedMetricTimeSeriesTooltip'
import {
    ComposedMetricTimeSeriesXAxisTick,
    X_AXIS_HEIGHT,
} from './components/ComposedMetricTimeSeriesXAxisTick'
import { HorizontalGridLine } from './components/HorizontalGridLine'
import {
    AXIS_COLOR,
    BASELINE_STROKE_WIDTH,
    DEFAULT_BAR_COLOR,
    DEFAULT_CHART_HEIGHT,
    DEFAULT_DATE_KEY,
    DEFAULT_LINE_COLOR,
    GRID_COLOR,
    HORIZONTAL_GRID_DASH_ARRAY,
    MARKER_DOT_RADIUS,
    TICK_COLOR,
    Y_AXIS_TICK_COUNT,
    Y_AXIS_WIDTH,
} from './constants'
import { useChartWrapperWidth } from './hooks/useChartWrapperWidth'
import type { ComposedMetricTimeSeriesChartProps } from './types'
import {
    getHorizontalGridValues,
    getMarkerPoints,
    getNumericAxisTicks,
    resolveResponsiveContainerWidth,
    sampleXAxisTickValues,
} from './utils'
import css from './ComposedMetricTimeSeriesChart.less'

export type {
    ComposedMetricTimeSeriesChartProps,
    ComposedMetricTimeSeriesDataItem,
    ComposedMetricTimeSeriesMarker,
    ComposedMetricTimeSeriesMetricConfig,
    ComposedMetricTimeSeriesTooltipMetric,
    ComposedMetricTimeSeriesTooltipProps,
} from './types'

export { renderComposedMetricTimeSeriesTooltipContent } from './components/ComposedMetricTimeSeriesTooltip'

export const ComposedMetricTimeSeriesChart = ({
    containerHeight,
    containerWidth,
    data,
    barMetric,
    lineMetric,
    dateKey = DEFAULT_DATE_KEY,
    dateFormatter,
    isLoading = false,
    chartHeight = DEFAULT_CHART_HEIGHT,
    legendGap,
    maxBarSize = 40,
    markerColor,
    markerLegendLabel,
    markers = [],
    renderTooltip,
    withLegend = true,
}: ComposedMetricTimeSeriesChartProps) => {
    const { chartWrapperRef, chartWrapperWidth } =
        useChartWrapperWidth(isLoading)

    const xAxisAvailableWidth =
        typeof containerWidth === 'number' ? containerWidth : chartWrapperWidth
    const xAxisTickValues = useMemo(
        () =>
            sampleXAxisTickValues(
                data,
                dateKey,
                xAxisAvailableWidth,
                dateFormatter,
            ),
        [data, dateFormatter, dateKey, xAxisAvailableWidth],
    )

    if (isLoading) {
        return (
            <Box
                flexDirection="column"
                width={containerWidth}
                height={containerHeight}
                gap="lg"
            >
                <TimeSeriesChartSkeleton chartHeight={chartHeight} />
            </Box>
        )
    }

    const resolvedBarMetric = {
        ...barMetric,
        color: barMetric.color ?? DEFAULT_BAR_COLOR,
    }
    const resolvedLineMetric = {
        ...lineMetric,
        color: lineMetric.color ?? DEFAULT_LINE_COLOR,
    }
    const resolvedMarkerColor = markerColor ?? resolvedLineMetric.color
    // When the line metric gaps on a marker's date, anchor the marker at the
    // vertical middle of the line metric's domain so the dot doesn't collide
    // with the topmost axis tick/gridline.
    const lineMetricDomainFallback =
        typeof lineMetric.yAxisDomain?.[0] === 'number' &&
        typeof lineMetric.yAxisDomain?.[1] === 'number'
            ? (lineMetric.yAxisDomain[0] + lineMetric.yAxisDomain[1]) / 2
            : undefined
    const markerPoints = getMarkerPoints(
        data,
        markers,
        dateKey,
        lineMetric.dataKey,
        lineMetricDomainFallback,
    )
    const responsiveContainerWidth =
        resolveResponsiveContainerWidth(containerWidth)
    const lineMetricTicks = getNumericAxisTicks(lineMetric.yAxisDomain)
    const barMetricTicks = getNumericAxisTicks(barMetric.yAxisDomain)
    const gridYAxisId = lineMetricTicks ? 'lineMetric' : 'barMetric'
    const horizontalGridValues = getHorizontalGridValues(
        lineMetricTicks ?? barMetricTicks,
    )
    const legendStyle =
        legendGap === undefined ? undefined : { marginTop: legendGap }

    return (
        <Box
            flexDirection="column"
            width={containerWidth}
            height={containerHeight}
            gap="xs"
            className={css.chartContainer}
        >
            <div ref={chartWrapperRef} className={css.chartWrapper}>
                <ResponsiveContainer
                    width={responsiveContainerWidth}
                    height={chartHeight}
                >
                    <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            horizontal={HorizontalGridLine}
                            vertical={false}
                            strokeDasharray={HORIZONTAL_GRID_DASH_ARRAY}
                            strokeLinecap="round"
                            stroke={GRID_COLOR}
                            horizontalValues={horizontalGridValues}
                            syncWithTicks={true}
                            yAxisId={gridYAxisId}
                        />
                        <XAxis
                            dataKey={dateKey}
                            height={X_AXIS_HEIGHT}
                            tick={(props) => (
                                <ComposedMetricTimeSeriesXAxisTick
                                    {...props}
                                    dateFormatter={dateFormatter}
                                />
                            )}
                            axisLine={{
                                stroke: AXIS_COLOR,
                                strokeWidth: BASELINE_STROKE_WIDTH,
                            }}
                            tickLine={false}
                            ticks={xAxisTickValues}
                            interval={0}
                            minTickGap={0}
                            tickMargin={0}
                            tickSize={0}
                        />
                        <YAxis
                            yAxisId="lineMetric"
                            orientation="left"
                            tick={{ fill: TICK_COLOR, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={lineMetric.yAxisFormatter}
                            domain={lineMetric.yAxisDomain}
                            tickCount={Y_AXIS_TICK_COUNT}
                            ticks={lineMetricTicks}
                            width={Y_AXIS_WIDTH}
                        />
                        <YAxis
                            yAxisId="barMetric"
                            orientation="right"
                            tick={{ fill: TICK_COLOR, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={barMetric.yAxisFormatter}
                            domain={barMetric.yAxisDomain}
                            tickCount={Y_AXIS_TICK_COUNT}
                            ticks={barMetricTicks}
                            width={Y_AXIS_WIDTH}
                        />
                        <Tooltip
                            content={renderComposedMetricTimeSeriesTooltipContent(
                                {
                                    barMetric,
                                    lineMetric,
                                    dateKey,
                                    dateFormatter,
                                    markers,
                                    renderTooltip,
                                    barColor: resolvedBarMetric.color,
                                    lineColor: resolvedLineMetric.color,
                                    markerColor: resolvedMarkerColor,
                                },
                            )}
                            cursor={false}
                        />
                        <Bar
                            yAxisId="barMetric"
                            dataKey={barMetric.dataKey}
                            fill={resolvedBarMetric.color}
                            maxBarSize={maxBarSize}
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-in-out"
                        />
                        <Line
                            yAxisId="lineMetric"
                            type="monotone"
                            dataKey={lineMetric.dataKey}
                            stroke={resolvedLineMetric.color}
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            dot={false}
                            connectNulls={true}
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-in-out"
                        />
                        {markerPoints.map((marker) => (
                            <ReferenceDot
                                key={marker.id}
                                yAxisId="lineMetric"
                                x={marker.date}
                                y={marker.value}
                                r={MARKER_DOT_RADIUS}
                                fill={resolvedMarkerColor}
                                stroke={resolvedMarkerColor}
                                ifOverflow="extendDomain"
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            {withLegend && (
                <ComposedMetricTimeSeriesChartLegend
                    barMetric={resolvedBarMetric}
                    lineMetric={resolvedLineMetric}
                    markerColor={resolvedMarkerColor}
                    markerLegendLabel={markerLegendLabel}
                    style={legendStyle}
                />
            )}
        </Box>
    )
}
