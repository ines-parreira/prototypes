import { Box, Text } from '@gorgias/axiom'

import type {
    ChartLegendProps,
    LegendGlyphProps,
    LegendGlyphVariant,
} from '../types'

import css from '../ComposedMetricTimeSeriesChart.less'

const getLegendGlyphClassName = (variant: LegendGlyphVariant) =>
    [
        css.legendGlyph,
        variant === 'line' ? css.lineLegendGlyph : css.legendCheckboxGlyph,
    ]
        .filter(Boolean)
        .join(' ')

const LegendGlyph = ({ color, variant }: LegendGlyphProps) => (
    <div
        aria-hidden="true"
        className={getLegendGlyphClassName(variant)}
        data-legend-glyph={variant}
        style={{ backgroundColor: color }}
    />
)

export const ComposedMetricTimeSeriesChartLegend = ({
    barMetric,
    lineMetric,
    markerColor,
    markerLegendLabel,
    style,
}: ChartLegendProps) => (
    <Box className={css.legend} flexWrap="wrap" gap="xs" style={style}>
        <Box alignItems="center" gap="xxs">
            <LegendGlyph color={lineMetric.color} variant="line" />
            <Text size="sm" color="content-neutral-secondary">
                {lineMetric.label}
            </Text>
        </Box>
        <Box alignItems="center" gap="xxs">
            <LegendGlyph color={barMetric.color} variant="checkbox" />
            <Text size="sm" color="content-neutral-secondary">
                {barMetric.label}
            </Text>
        </Box>
        {markerLegendLabel && (
            <Box alignItems="center" gap="xxs">
                <LegendGlyph color={markerColor} variant="checkbox" />
                <Text size="sm" color="content-neutral-secondary">
                    {markerLegendLabel}
                </Text>
            </Box>
        )}
    </Box>
)
