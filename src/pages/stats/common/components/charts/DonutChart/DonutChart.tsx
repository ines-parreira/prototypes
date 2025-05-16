import React, { ReactNode, useCallback, useMemo, useState } from 'react'

import {
    ActiveElement,
    ChartData,
    ChartMeta,
    ChartOptions,
    Plugin,
} from 'chart.js'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import { Doughnut } from 'react-chartjs-2'

import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import typography from '@gorgias/design-tokens/dist/tokens/typography.json'
import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useTheme } from 'core/theme'
import css from 'pages/stats/common/components/charts/Chart.less'
import { ChartTooltip } from 'pages/stats/common/components/charts/ChartTooltip'
import Legend from 'pages/stats/common/components/charts/Legend'
import { useCustomTooltip } from 'pages/stats/common/useCustomTooltip'
import { OneDimensionalDataItem } from 'pages/stats/types'
import { renderTickLabelAsNumber } from 'pages/stats/utils'

import { DonutChartTooltip } from './DonutChartTooltip'

const STAT_COLORS = [
    colors['📺 Classic'].Main.Primary.value,
    colors['📺 Classic'].Feedback.Warning.value,
    colors['📺 Classic'].Feedback.Success.value,
    colors['📺 Classic'].Feedback.Error.value,
]

const innerLabelPlugin: Plugin<'doughnut'> = {
    id: 'innerLabel',
    afterDatasetDraw(chart, args) {
        const meta = args.meta as ChartMeta<'doughnut'>
        if (meta.total) {
            const xCoor = meta.data[0].x
            const yCoor = meta.data[0].y
            const ctx = chart.ctx

            const total = renderTickLabelAsNumber(meta.total)
            const currentTypography =
                typography['💬 Help Desk'].Heading['Page | Semibold']
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = `${currentTypography['font-weight'].value} ${currentTypography['font-size'].value} ${currentTypography['font-family'].value}`
            ctx.fillText(total, xCoor, yCoor)
            ctx.save()
        }
    },
}

export const DONUT_TOOLTIP_TARGET = 'donutChartTooltip'

type DoughnutStatProps = {
    width?: number
    height?: number
    customColors?: string[]
    displayLegend?: boolean
    isLoading?: boolean
    data: OneDimensionalDataItem[]
    skeletonHeight?: number
    showTooltip?: boolean
    className?: string
    legendClassName?: string
    children?: ReactNode
    onSegmentClick?: (dataIndex: number) => void
}

const DonutChart = ({
    width = 180,
    height = 180,
    customColors,
    displayLegend = false,
    isLoading = false,
    showTooltip = true,
    skeletonHeight,
    data,
    className,
    legendClassName,
    children,
    onSegmentClick,
}: DoughnutStatProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const theme = useTheme()
    const total = useMemo(
        () => data.reduce((acc, i) => acc + i.value, 0),
        [data],
    )
    const greyColor = useMemo(
        () => theme.tokens.Neutral.Grey_2.value,
        [theme.tokens.Neutral.Grey_2.value],
    )
    const { customTooltip, tooltipData, tooltipStyle } = useCustomTooltip()

    const handleDonutHover = useCallback(
        (_event: unknown, elements: ActiveElement[]) => {
            setHoveredIndex(elements.length ? elements[0].index : null)
        },
        [],
    )

    const debouncedOnMouseLeave = useMemo(
        () => _debounce(() => setHoveredIndex(null), 100),
        [],
    )

    const chartColors = useCallback(
        (index: number) => {
            const color = customColors?.[index] || STAT_COLORS[index]
            return hoveredIndex === null || index === hoveredIndex
                ? color
                : greyColor
        },
        [customColors, hoveredIndex, greyColor],
    )

    const legendColors = useCallback(
        (index: number) => customColors?.[index] || STAT_COLORS[index],
        [customColors],
    )

    const formattedData: ChartData<'doughnut', number[], string> =
        useMemo(() => {
            const labels: string[] = []
            const values: number[] = []
            const backgroundColors: string[] = []
            const borderColors: string[] = []

            data.forEach((item, index) => {
                const color = chartColors(index)
                labels.push(item.label)
                values.push(item.value)
                backgroundColors.push(color)
                borderColors.push(color === greyColor ? greyColor : '#fff')
            })

            return {
                labels,
                datasets: [
                    {
                        backgroundColor: backgroundColors,
                        hoverBackgroundColor: backgroundColors,
                        borderColor: borderColors,
                        data: values,
                    },
                ],
            }
        }, [data, chartColors, greyColor])

    const handleChartSegmentClick = useCallback(
        (_event: unknown, elements: ActiveElement[]) => {
            if (elements.length > 0) {
                const chartElement = elements[0]
                const dataIndex = chartElement.index

                if (onSegmentClick) {
                    onSegmentClick(dataIndex)
                }
            }
        },
        [onSegmentClick],
    )

    const isSegmentHoveredAndClickable = useMemo(
        () => hoveredIndex !== null && onSegmentClick,
        [hoveredIndex, onSegmentClick],
    )

    const options: ChartOptions<'doughnut'> = useMemo(
        () => ({
            onHover: handleDonutHover,
            elements: {
                arc: { borderWidth: 1 },
            },
            hover: {
                intersect: false,
                mode: 'point',
            },
            cutout: '65%',
            interaction: {
                intersect: false,
                mode: 'point',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: false,
                    external: customTooltip,
                },
            },
            ...(onSegmentClick && {
                onClick: handleChartSegmentClick,
            }),
        }),
        [
            handleDonutHover,
            onSegmentClick,
            handleChartSegmentClick,
            customTooltip,
        ],
    )

    const plugins = useMemo(
        () => (!children ? [innerLabelPlugin] : []),
        [children],
    )

    if (isLoading) {
        return (
            <div className={css.donutSkeleton}>
                <Skeleton height={skeletonHeight ?? height} width={width} />
                {displayLegend && (
                    <Skeleton height={24} className="mt-4" width={width} />
                )}
            </div>
        )
    }

    return (
        <div className={className}>
            <div
                className={classnames(css.container, {
                    ['clickable']: isSegmentHoveredAndClickable,
                })}
                onMouseLeave={debouncedOnMouseLeave}
            >
                <Doughnut
                    id={DONUT_TOOLTIP_TARGET}
                    data={formattedData}
                    options={options}
                    width={width}
                    height={height}
                    plugins={plugins}
                />
                {children}
                {showTooltip && (
                    <ChartTooltip
                        target={DONUT_TOOLTIP_TARGET}
                        tooltipStyle={tooltipStyle}
                    >
                        {tooltipData && (
                            <DonutChartTooltip
                                total={total}
                                tooltip={tooltipData}
                            />
                        )}
                    </ChartTooltip>
                )}
            </div>
            {displayLegend && (
                <Legend
                    className={legendClassName}
                    items={data.map(({ label }, index) => ({
                        label,
                        color: legendColors(index),
                    }))}
                />
            )}
        </div>
    )
}

export default DonutChart
