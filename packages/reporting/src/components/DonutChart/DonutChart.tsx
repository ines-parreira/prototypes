import { useState } from 'react'

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Sector,
    Tooltip,
} from 'recharts'

import type { SizeValue } from '@gorgias/axiom'
import { Box, Skeleton } from '@gorgias/axiom'

import { useTooltipPosition } from '../ChartCard/hooks/useTooltipPosition'
import type { ChartDataItem } from '../ChartCard/types'
import { assignColorsToData } from '../ChartCard/utils/colorUtils'
import { DonutChartLegend } from './components/DonutChartLegend'
import { DonutChartTooltip } from './components/DonutChartTooltip'
import {
    DonutChartHoverProvider,
    useDonutChartHover,
} from './context/DonutChartHoverContext'

import css from './DonutChart.less'

type DonutChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: ChartDataItem[]
    isLoading?: boolean
    valueFormatter?: (value: number) => string
    period?: {
        start_datetime: string
        end_datetime: string
    }
}

const INNER_RADIUS = 60
const OUTER_RADIUS = 95
const PADDING_ANGLE = 2
const CORNER_RADIUS = 4
const ACTIVE_SHAPE_RADIUS_OFFSET = 5
const CHART_HEIGHT = 210

export const renderActiveShape = (props: any) => {
    const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        cornerRadius,
    } = props

    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius - ACTIVE_SHAPE_RADIUS_OFFSET}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            cornerRadius={cornerRadius}
        />
    )
}

export const renderTooltipContent =
    (
        valueFormatter?: (value: number) => string,
        period?: {
            start_datetime: string
            end_datetime: string
        },
    ) =>
    ({ payload }: any) => {
        if (!payload?.[0]) return null
        const data = payload[0].payload
        return (
            <DonutChartTooltip
                name={data.name}
                value={data.value}
                color={data.color}
                period={period}
                valueFormatter={valueFormatter}
            />
        )
    }

const DonutChartInner = ({
    containerHeight,
    containerWidth,
    data,
    period,
    valueFormatter,
}: Omit<DonutChartProps, 'isLoading'>) => {
    const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(new Set())
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const onPieMouseMove = useTooltipPosition()
    const { hoveredLegendItem } = useDonutChartHover()

    const dataWithColors = assignColorsToData(data)

    const toggleSegment = (name: string) => {
        setHiddenSegments((prev) => {
            const next = new Set(prev)
            const visibleCount = dataWithColors.length - prev.size

            if (next.has(name)) {
                next.delete(name)
            } else {
                if (visibleCount === 1) {
                    return new Set()
                }
                next.add(name)
            }
            return next
        })
    }

    const visibleData = dataWithColors.filter(
        (item) => !hiddenSegments.has(item.name),
    )

    const totalValue = visibleData.reduce(
        (sum, item) => sum + (item.value ?? 0),
        0,
    )

    const dataWithPercentages = dataWithColors.map((item) => ({
        ...item,
        legendValue: visibleData.find((i) => i.name === item.name)
            ? `${(((item.value ?? 0) / totalValue) * 100).toFixed(2)}%`
            : '0%',
        percentage: valueFormatter
            ? valueFormatter(item.value ?? 0)
            : (item.value ?? 0),
    }))

    const legendHoveredIndex = hoveredLegendItem
        ? visibleData.findIndex((item) => item.name === hoveredLegendItem)
        : null

    const effectiveActiveIndex =
        legendHoveredIndex !== null && legendHoveredIndex !== -1
            ? legendHoveredIndex
            : activeIndex

    return (
        <Box
            flexDirection="column"
            width={containerWidth}
            height={containerHeight}
            gap="lg"
        >
            <Box
                flexDirection="column"
                alignItems="center"
                justifyContent="space-between"
                className={css.chartWrapper}
            >
                <Box className={css.chartContainer}>
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                        <PieChart onMouseMove={onPieMouseMove}>
                            <Pie
                                data={visibleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={INNER_RADIUS}
                                outerRadius={OUTER_RADIUS}
                                paddingAngle={PADDING_ANGLE}
                                dataKey="value"
                                cornerRadius={CORNER_RADIUS}
                                activeShape={renderActiveShape}
                                // @ts-expect-error - activeIndex is supported by Recharts but not in types
                                activeIndex={effectiveActiveIndex ?? undefined}
                                onMouseEnter={(_, index) =>
                                    setActiveIndex(index)
                                }
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {visibleData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={
                                            effectiveActiveIndex === null ||
                                            effectiveActiveIndex === index
                                                ? 1
                                                : 0.3
                                        }
                                        stroke="transparent"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={renderTooltipContent(
                                    valueFormatter,
                                    period,
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>

                <DonutChartLegend
                    items={dataWithPercentages}
                    hiddenSegments={hiddenSegments}
                    onToggleSegment={toggleSegment}
                />
            </Box>
        </Box>
    )
}

export const DonutChart = ({
    containerHeight,
    containerWidth,
    data,
    period,
    isLoading = false,
    valueFormatter,
}: DonutChartProps) => {
    if (isLoading) {
        return (
            <Box
                flexDirection="column"
                width={containerWidth}
                height={containerHeight}
                gap="lg"
            >
                <Box
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="space-between"
                    className={css.chartWrapper}
                >
                    <Box
                        className={css.donutSkeleton}
                        height={CHART_HEIGHT}
                        mb="17px"
                        pb="sm"
                        pt="sm"
                    >
                        <Box className={css.donutSkeletonOuter}>
                            <Skeleton
                                width={OUTER_RADIUS * 2}
                                height={OUTER_RADIUS * 2}
                            />
                        </Box>
                        <div className={css.donutSkeletonInner}>&nbsp;</div>
                    </Box>

                    <Box flexDirection="column" gap="xxs" width="100%">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Box
                                key={index}
                                flexDirection="row"
                                gap="xs"
                                alignItems="center"
                            >
                                <Box mb="xxs" ml="xxxs">
                                    <Skeleton width={10} height={10} circle />
                                </Box>
                                <Skeleton height={16} width={120} />
                                <Skeleton height={16} width={40} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        )
    }

    return (
        <DonutChartHoverProvider>
            <DonutChartInner
                containerHeight={containerHeight}
                containerWidth={containerWidth}
                data={data}
                period={period}
                valueFormatter={valueFormatter}
            />
        </DonutChartHoverProvider>
    )
}
