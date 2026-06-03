import { Box, Link, Text } from '@gorgias/axiom'

import {
    DEFAULT_BAR_COLOR,
    DEFAULT_DATE_KEY,
    DEFAULT_LINE_COLOR,
} from '../constants'
import type {
    ComposedMetricTimeSeriesDataItem,
    ComposedMetricTimeSeriesTooltipProps,
    TooltipMarkerProps,
    TooltipMetricRowProps,
    TooltipRendererOptions,
} from '../types'
import {
    formatMetricValue,
    getActiveMarkers,
    getTooltipDate,
    getTooltipMetricValue,
} from '../utils'

import css from '../ComposedMetricTimeSeriesChart.less'

const TooltipMetricRow = ({ metric }: TooltipMetricRowProps) => (
    <Box justifyContent="space-between" gap="lg" width="100%">
        <Text size="sm" variant="regular" className={css.tooltipText}>
            {metric.label}
        </Text>
        <Text size="sm" variant="bold" className={css.tooltipValue}>
            {metric.formattedValue}
        </Text>
    </Box>
)

const TooltipMarker = ({ marker, markerColor }: TooltipMarkerProps) => (
    <Box flexDirection="column" gap="xxxs" width="100%">
        <Box alignItems="center" gap="xxs" width="100%">
            <span
                aria-hidden="true"
                className={css.tooltipMarkerGlyph}
                style={{ backgroundColor: markerColor }}
            />
            <Text size="sm" variant="regular" className={css.tooltipText}>
                {marker.label}
            </Text>
        </Box>
        {marker.description && (
            <Text size="sm" variant="regular" className={css.tooltipMutedText}>
                {marker.description}
            </Text>
        )}
        {marker.actionHref && (
            <Link
                href={marker.actionHref}
                size="sm"
                trailingSlot="external-link"
            >
                {marker.actionLabel ?? 'View this version'}
            </Link>
        )}
    </Box>
)

export const ComposedMetricTimeSeriesTooltip = ({
    date,
    barMetric,
    lineMetric,
    markerColor,
    markers,
}: ComposedMetricTimeSeriesTooltipProps) => (
    <Box className={css.tooltip} flexDirection="column" gap="xxxs">
        <Text size="sm" variant="regular" className={css.tooltipMutedText}>
            {date}
        </Text>
        <TooltipMetricRow metric={lineMetric} />
        <TooltipMetricRow metric={barMetric} />
        {markers.length > 0 && (
            <Box
                flexDirection="column"
                gap="xxxs"
                width="100%"
                className={css.tooltipMarkers}
            >
                {markers.map((marker) => (
                    <TooltipMarker
                        key={marker.id}
                        marker={marker}
                        markerColor={markerColor}
                    />
                ))}
            </Box>
        )}
    </Box>
)

export const renderComposedMetricTimeSeriesTooltipContent =
    ({
        barMetric,
        lineMetric,
        dateKey = DEFAULT_DATE_KEY,
        dateFormatter,
        markers = [],
        renderTooltip,
        barColor = barMetric.color ?? DEFAULT_BAR_COLOR,
        lineColor = lineMetric.color ?? DEFAULT_LINE_COLOR,
        markerColor,
    }: TooltipRendererOptions) =>
    ({ payload }: any) => {
        if (!payload?.[0]) return null

        const data = payload[0].payload as ComposedMetricTimeSeriesDataItem
        const rawDate = getTooltipDate(data, dateKey)
        const activeMarkers = getActiveMarkers(markers, rawDate)
        const barValue = getTooltipMetricValue(payload, data, barMetric.dataKey)
        const lineValue = getTooltipMetricValue(
            payload,
            data,
            lineMetric.dataKey,
        )
        const tooltipProps: ComposedMetricTimeSeriesTooltipProps = {
            date: dateFormatter ? dateFormatter(rawDate) : rawDate,
            barMetric: {
                label: barMetric.label,
                color: barColor,
                value: barValue,
                formattedValue: formatMetricValue(
                    barValue,
                    barMetric.valueFormatter,
                ),
            },
            lineMetric: {
                label: lineMetric.label,
                color: lineColor,
                value: lineValue,
                formattedValue: formatMetricValue(
                    lineValue,
                    lineMetric.valueFormatter,
                ),
            },
            markerColor: markerColor ?? lineColor,
            markers: activeMarkers,
        }

        return renderTooltip ? (
            renderTooltip(tooltipProps)
        ) : (
            <ComposedMetricTimeSeriesTooltip {...tooltipProps} />
        )
    }
