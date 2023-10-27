import React, {useCallback, useMemo} from 'react'
import {Doughnut} from 'react-chartjs-2'
import {
    Plugin,
    ChartData,
    ChartMeta,
    ChartOptions,
    TooltipModel,
} from 'chart.js'
import colors from 'assets/tokens/colors.json'
import {OneDimensionalDataItem} from 'pages/stats/types'
import Legend from 'pages/stats/Legend'
import {renderTickLabelAsNumber} from 'pages/stats/utils'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {useCustomTooltip} from '../../../../useCustomTooltip'
import {ChartTooltip} from '../../../../ChartTooltip'
import {DonutChartTooltip} from './DonutChartTooltip'

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
            const height = chart.height
            const ctx = chart.ctx

            const total = renderTickLabelAsNumber(meta.total)
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const fontSize = (height * 0.4) / 2
            ctx.font = `600 ${fontSize}px Inter`
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
}

const DonutChart = ({
    width = 180,
    height = 180,
    customColors,
    displayLegend = false,
    isLoading = false,
    showTooltip = true,
    skeletonHeight = 250,
    data,
}: DoughnutStatProps) => {
    const total = useMemo(
        () => data.reduce((acc, i) => acc + i.value, 0),
        [data]
    )
    const {customTooltip, tooltipData, tooltipStyle} = useCustomTooltip()

    const chartColors = useCallback(
        (index: number) => customColors?.[index] || STAT_COLORS[index],
        [customColors]
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
            cutout: '60%',
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
        [customTooltip]
    )

    if (isLoading) {
        return <Skeleton height={skeletonHeight} />
    }

    return (
        <div>
            <Doughnut
                id={DONUT_TOOLTIP_TARGET}
                data={formattedData}
                options={options}
                plugins={[innerLabelPlugin]}
                width={width}
                height={height}
            />
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
            {displayLegend && (
                <Legend
                    items={data.map(({label}, index) => ({
                        label,
                        color: chartColors(index),
                    }))}
                />
            )}
        </div>
    )
}

export default DonutChart
