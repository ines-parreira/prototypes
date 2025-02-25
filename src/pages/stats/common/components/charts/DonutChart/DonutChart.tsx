import React, { ReactNode, useCallback, useMemo } from 'react'

import {
    ChartData,
    ChartMeta,
    ChartOptions,
    Plugin,
    TooltipModel,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import typography from '@gorgias/design-tokens/dist/tokens/typography.json'
import { Skeleton } from '@gorgias/merchant-ui-kit'

import { ChartTooltip } from 'pages/stats/ChartTooltip'
import css from 'pages/stats/common/components/charts/Chart.less'
import { useCustomTooltip } from 'pages/stats/common/useCustomTooltip'
import Legend from 'pages/stats/Legend'
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

const DONUT_TOOLTIP_TARGET = 'donutChartTooltip'

type DoughnutStatProps = {
    width?: number
    height?: number
    customColors?: string[]
    displayLegend?: boolean
    isLoading?: boolean
    data: OneDimensionalDataItem[]
    skeletonHeight?: number
    customTooltip?: TooltipModel
    showTooltip?: boolean
    className?: string
    legendClassName?: string
    children?: ReactNode
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
}: DoughnutStatProps) => {
    const total = useMemo(
        () => data.reduce((acc, i) => acc + i.value, 0),
        [data],
    )
    const { customTooltip, tooltipData, tooltipStyle } = useCustomTooltip()

    const chartColors = useCallback(
        (index: number) => customColors?.[index] || STAT_COLORS[index],
        [customColors],
    )

    const formattedData: ChartData<'doughnut'> = useMemo(() => {
        const labels = data.map((d) => d.label)

        return {
            labels,
            datasets: [
                {
                    backgroundColor: data.map((_, index) => chartColors(index)),
                    label: '',
                    data: data.map((d) => d.value),
                },
            ],
        }
    }, [data, chartColors])

    const options: ChartOptions<'doughnut'> = useMemo(
        () => ({
            elements: {
                arc: { borderWidth: 1 },
            },
            cutout: '65%',
            interaction: {
                intersect: false,
                mode: 'point',
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                    external: customTooltip,
                },
            },
        }),
        [customTooltip],
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
            <div className={css.container}>
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
                        color: chartColors(index),
                    }))}
                />
            )}
        </div>
    )
}

export default DonutChart
