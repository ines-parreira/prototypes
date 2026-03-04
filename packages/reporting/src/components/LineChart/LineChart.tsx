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
} from '@gorgias/axiom'

import type { MetricTrendFormat, TwoDimensionalDataItem } from '../../types'
import { formatMetricValueOrString } from '../../utils/helpers'
import { ChartTooltip } from '../ChartTooltip/ChartTooltip'
import { toChartData } from './utils'

const CHART_COLOR = 'var(--purple-500)'

type LineChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    currency?: string
    data: TwoDimensionalDataItem[]
    isCurvedLine?: boolean
    isLoading?: boolean
    metrics?: { id: string; label: string }[]
    metricFormat?: MetricTrendFormat
    onMetricChange?: (metric: string) => void
    skeletonHeight?: number
    title: string
    variant?: 'line' | 'area'
}
export const LineChart = ({
    containerHeight,
    containerWidth,
    currency,
    data,
    isCurvedLine = true,
    isLoading = false,
    metrics,
    metricFormat,
    onMetricChange,
    skeletonHeight = 250,
    title,
    variant = 'line',
}: LineChartProps) => {
    const gradientId = useId()
    const formatter = formatMetricValueOrString({ metricFormat, currency })
    if (isLoading) {
        return <Skeleton height={skeletonHeight} />
    }

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
                paddingTop={22}
                paddingBottom={22}
                paddingLeft="lg"
                paddingRight="lg"
                gap="lg"
            >
                <Box alignItems="center">
                    <Heading>{title}</Heading>
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
                                {(option) => <ListItem label={option.label} />}
                            </Select>
                        </div>
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
                            strokeDasharray="1.5 3"
                            vertical={false}
                        />
                        <XAxis dataKey="name" interval="preserveStartEnd" />
                        <YAxis width="auto" tickFormatter={formatter} />
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
