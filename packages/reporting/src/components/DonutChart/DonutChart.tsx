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
            innerRadius={innerRadius}
            outerRadius={outerRadius + ACTIVE_SHAPE_RADIUS_OFFSET}
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

export const DonutChart = ({
    containerHeight,
    containerWidth,
    data,
    period,
    isLoading = false,
    valueFormatter,
}: DonutChartProps) => {
    const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(new Set())
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const onPieMouseMove = useTooltipPosition()

    const dataWithColors = assignColorsToData(data)

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

    const totalValue = visibleData.reduce((sum, item) => sum + item.value, 0)

    const dataWithPercentages = dataWithColors.map((item) => ({
        ...item,
        legendValue: `${((item.value / totalValue) * 100).toFixed(2)}%`,
        percentage: valueFormatter ? valueFormatter(item.value) : item.value,
    }))

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
                                            activeIndex === null ||
                                            activeIndex === index
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
