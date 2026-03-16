import { useCallback, useMemo, useRef, useState } from 'react'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import type { SizeValue } from '@gorgias/axiom'
import { Box, Button, Heading, Skeleton, Text } from '@gorgias/axiom'

import type { ChartDataItem } from '../ChartCard/types'

import css from './HorizontalBarChart.less'

type HorizontalBarChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: ChartDataItem[]
    isLoading?: boolean
    valueFormatter?: (value: number) => string
    initialItemsCount?: number
    showExpandButton?: boolean
    maxExpandedHeight?: number
}

const BAR_FILL_COLOR = '#7e55f6'
const BAR_BACKGROUND_COLOR = '#f1ecff'
const BAR_HEIGHT = 56
const BAR_SIZE = 16
const LABEL_TO_BAR_GAP = 8

type YAxisTickProps = {
    x: number
    y: number
    payload: { value: string }
}

const YAxisLeftTick = ({ y, payload }: YAxisTickProps) => {
    const yPosition = y - BAR_SIZE / 2 - LABEL_TO_BAR_GAP
    return (
        <text
            x={0}
            y={yPosition}
            textAnchor="start"
            dominantBaseline="auto"
            className={css.barLabel}
            fontSize={14}
            fill="var(--content-neutral-default)"
        >
            {payload.value}
        </text>
    )
}

type YAxisRightTickProps = {
    x: number
    y: number
    payload: { value: number }
    valueFormatter?: (value: number) => string
    chartWidth: number
}

const YAxisRightTick = ({
    y,
    payload,
    valueFormatter,
    chartWidth,
}: YAxisRightTickProps) => {
    const formattedValue = valueFormatter
        ? valueFormatter(payload.value)
        : payload.value.toLocaleString()

    const yPosition = y - BAR_SIZE / 2 - LABEL_TO_BAR_GAP
    return (
        <text
            x={chartWidth}
            y={yPosition}
            textAnchor="end"
            dominantBaseline="auto"
            className={css.barValue}
            fontSize={14}
            fill="var(--content-neutral-default)"
        >
            {formattedValue}
        </text>
    )
}

export const HorizontalBarChart = ({
    containerHeight,
    containerWidth,
    data,
    isLoading = false,
    valueFormatter,
    initialItemsCount = 5,
    showExpandButton = true,
    maxExpandedHeight,
}: HorizontalBarChartProps) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [chartContainerWidth, setChartContainerWidth] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleResize = useCallback(() => {
        if (containerRef.current) {
            setChartContainerWidth(containerRef.current.offsetWidth)
        }
    }, [])

    const shouldShowExpandButton =
        showExpandButton && data.length > initialItemsCount
    const displayData = isExpanded ? data : data.slice(0, initialItemsCount)

    const maxValue = Math.max(...data.map((item) => item.value ?? 0))

    const chartData = useMemo(() => displayData, [displayData])

    const chartHeight = displayData.length * BAR_HEIGHT

    if (isLoading) {
        return (
            <Box
                flexDirection="column"
                width={containerWidth}
                height={containerHeight}
                gap="md"
            >
                {Array.from({ length: initialItemsCount }).map((_, index) => (
                    <Box
                        key={index}
                        flexDirection="column"
                        gap="xxxs"
                        className={css.barGroup}
                    >
                        <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Skeleton width={120} height={16} />
                            <Skeleton width={40} height={16} />
                        </Box>
                        <Skeleton height={16} />
                    </Box>
                ))}
            </Box>
        )
    }

    if (data.length === 0) {
        return (
            <Box
                height="274px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                marginBottom="xxl"
                gap="xs"
            >
                <Heading size="sm">No data found</Heading>
                <Text size="md" color="content-neutral-secondary">
                    Try to adjust your report filters.
                </Text>
            </Box>
        )
    }

    return (
        <Box
            flexDirection="column"
            width={containerWidth}
            height={containerHeight}
            gap="md"
            className={css.chartContainer}
        >
            <div
                className={`${css.barGroupContainer} ${isExpanded && maxExpandedHeight ? css.scrollable : ''}`}
                style={
                    isExpanded && maxExpandedHeight
                        ? { maxHeight: maxExpandedHeight }
                        : undefined
                }
            >
                <div ref={containerRef} className={css.chartWrapper}>
                    <ResponsiveContainer
                        width="100%"
                        height={chartHeight}
                        onResize={handleResize}
                    >
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                        >
                            <XAxis
                                type="number"
                                hide
                                domain={[0, maxValue]}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId={0}
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={YAxisLeftTick}
                                width={1}
                            />
                            <YAxis
                                yAxisId={1}
                                orientation="right"
                                type="category"
                                dataKey="value"
                                axisLine={false}
                                tickLine={false}
                                tick={(props) => (
                                    <YAxisRightTick
                                        {...props}
                                        valueFormatter={valueFormatter}
                                        chartWidth={chartContainerWidth}
                                    />
                                )}
                                width={1}
                            />
                            <Bar
                                dataKey="value"
                                yAxisId={0}
                                fill={BAR_FILL_COLOR}
                                radius={4}
                                barSize={16}
                                background={{
                                    fill: BAR_BACKGROUND_COLOR,
                                    radius: 4,
                                }}
                                animationDuration={500}
                                animationEasing="ease-out"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {shouldShowExpandButton && (
                <Box display="flex" alignItems="flex-start">
                    <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        trailingSlot={
                            isExpanded
                                ? 'arrow-chevron-up'
                                : 'arrow-chevron-down'
                        }
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </Button>
                </Box>
            )}
        </Box>
    )
}
