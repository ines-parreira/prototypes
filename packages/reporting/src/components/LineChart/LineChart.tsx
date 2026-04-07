import { useId } from 'react'

import {
    Area,
    AreaChart as AreaChartRecharts,
    CartesianGrid,
    Line,
    LineChart as LineChartRecharts,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { SizeValue } from '@gorgias/axiom'
import {
    Box,
    Button,
    Card,
    Heading,
    Icon,
    ListItem,
    Select,
    Skeleton,
    Text,
} from '@gorgias/axiom'

import { NOT_AVAILABLE_PLACEHOLDER } from '../../constants'
import type {
    MetricTrendFormat,
    TrendDirection,
    TwoDimensionalDataItem,
} from '../../types'
import { formatMetricValueOrString } from '../../utils/helpers'
import { ChartTooltip } from '../ChartTooltip/ChartTooltip'
import { TimeSeriesChartSkeleton } from '../TimeSeriesChart/TimeSeriesChartSkeleton'
import { TrendBadge } from '../TrendBadge/TrendBadge'
import { toChartData } from './utils'

const CHART_COLOR = 'var(--purple-500)'
const GRID_COLOR = 'var(--border-neutral-secondary)'
const TICK_COLOR = 'var(--content-neutral-tertiary)'

type LineChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    currency?: string
    data: TwoDimensionalDataItem[]
    interpretAs?: TrendDirection
    isCurvedLine?: boolean
    isLoading?: boolean
    metrics?: { id: string; label: string }[]
    metricFormat?: MetricTrendFormat
    onMetricChange?: (metric: string) => void
    prevValue?: number | null
    skeletonHeight?: number
    title: string
    tooltipData?: { period: string }
    value?: number | null
    variant?: 'line' | 'area'
}
export const LineChart = ({
    containerHeight,
    containerWidth,
    currency,
    data,
    interpretAs,
    isCurvedLine = true,
    isLoading = false,
    metrics,
    metricFormat,
    onMetricChange,
    prevValue,
    title,
    tooltipData,
    value,
    variant = 'line',
}: LineChartProps) => {
    const gradientId = useId()
    const formatter = formatMetricValueOrString({ metricFormat, currency })
    const yAxisFormatter = formatMetricValueOrString({
        metricFormat,
        currency,
        compact: true,
    })
    if (isLoading) {
        return (
            <Card elevation="mid">
                <Box
                    flexDirection="column"
                    width={containerWidth}
                    height={containerHeight}
                    gap="lg"
                >
                    <Skeleton width={200} height={50} />
                    <TimeSeriesChartSkeleton chartHeight={320} />
                </Box>
            </Card>
        )
    }

    const hasValue = value !== undefined && value !== null && value !== 0
    const formattedValue =
        value !== undefined && value !== null
            ? formatter(value)
            : NOT_AVAILABLE_PLACEHOLDER

    const transformedData = toChartData(data)
    const isArea = variant === 'area'
    const ChartContainer = isArea ? AreaChartRecharts : LineChartRecharts
    const curveType = isCurvedLine ? 'monotone' : 'linear'

    return (
        <Card elevation="mid">
            <Box
                flexDirection="column"
                width={containerWidth}
                height={containerHeight}
                gap="lg"
            >
                <Box flexDirection="column" gap="xxxs">
                    <Box alignItems="center">
                        <Text size="md" variant="bold">
                            {title}
                        </Text>
                        {!!metrics && metrics.length > 1 && (
                            <div>
                                <Select
                                    selectedItem={metrics.find(
                                        (it) => it.label === title,
                                    )}
                                    onSelect={(item) => {
                                        onMetricChange?.(item.label)
                                    }}
                                    items={metrics}
                                    trigger={({ isOpen }) => (
                                        <Button
                                            size="sm"
                                            variant="tertiary"
                                            icon={
                                                isOpen ? (
                                                    <Icon
                                                        color="var(--content-neutral-default)"
                                                        name="arrow-chevron-up"
                                                        size="sm"
                                                    />
                                                ) : (
                                                    <Icon
                                                        color="var(--content-neutral-default)"
                                                        name="arrow-chevron-down"
                                                        size="sm"
                                                    />
                                                )
                                            }
                                        />
                                    )}
                                >
                                    {(option) => (
                                        <ListItem label={option.label} />
                                    )}
                                </Select>
                            </div>
                        )}
                    </Box>
                    {value !== undefined && (
                        <Box alignItems="center" gap="xxxs">
                            <Heading size="xl">
                                {hasValue
                                    ? formattedValue
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </Heading>
                            {hasValue && (
                                <TrendBadge
                                    value={value}
                                    prevValue={prevValue}
                                    metricFormat={metricFormat}
                                    currency={currency}
                                    interpretAs={interpretAs}
                                    tooltipData={tooltipData}
                                    size="md"
                                />
                            )}
                        </Box>
                    )}
                </Box>
                <ResponsiveContainer width="100%" height="100%">
                    <ChartContainer data={transformedData}>
                        {isArea && (
                            <defs>
                                <linearGradient
                                    id={gradientId}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor={CHART_COLOR}
                                        stopOpacity={0.2}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={CHART_COLOR}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                        )}
                        <CartesianGrid
                            strokeDasharray="0 6"
                            strokeLinecap="round"
                            stroke={GRID_COLOR}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            interval="preserveStartEnd"
                            axisLine={false}
                            tickLine={{ stroke: GRID_COLOR, strokeWidth: 0.75 }}
                            tickMargin={8}
                            tick={{ fill: TICK_COLOR, fontSize: 12 }}
                        />
                        <YAxis
                            tickFormatter={yAxisFormatter}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: TICK_COLOR, fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{
                                strokeDasharray: '1.5 3',
                                strokeWidth: '1px',
                                stroke: '#1E242E',
                            }}
                            content={ChartTooltip}
                            formatter={formatter}
                        />
                        {data.map((series) =>
                            isArea ? (
                                <Area
                                    key={series.label}
                                    type={curveType}
                                    dataKey={series.label}
                                    stroke={CHART_COLOR}
                                    fillOpacity={1}
                                    fill={`url(#${gradientId})`}
                                    dot={false}
                                />
                            ) : (
                                <Line
                                    key={series.label}
                                    type={curveType}
                                    dataKey={series.label}
                                    dot={false}
                                    stroke={CHART_COLOR}
                                />
                            ),
                        )}
                    </ChartContainer>
                </ResponsiveContainer>
            </Box>
        </Card>
    )
}
