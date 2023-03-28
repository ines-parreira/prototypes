import {Chart, ChartArea, ChartData, ChartOptions, Point} from 'chart.js'
import React, {useMemo, useState} from 'react'
import {Line} from 'react-chartjs-2'

import colors from 'assets/tokens/colors.json'
import css from './LineChart.less'
import {TwoDimensionalDataItem} from './types'
import {getGradient, NUMBER_TICK_FORMATTER} from './utils'

const STAT_COLORS = Object.freeze([
    colors['📺 Classic'].Main.Primary.value,
    colors['📺 Classic'].Feedback.Warning.value,
    colors['📺 Classic'].Feedback.Success.value,
    colors['📺 Classic'].Feedback.Error.value,
])

type Props = {
    data: TwoDimensionalDataItem[]
    hasBackground?: boolean
    displayLegend?: boolean
}

const LINE_OPTIONS: ChartOptions<'line'> = {
    elements: {
        point: {
            pointStyle: false,
        },
    },
    layout: {
        padding: {
            bottom: -8,
        },
    },
    responsive: true,
    scales: {
        x: {
            border: {
                color: colors['📺 Classic'].Neutral.Grey_3.value,
            },
            grid: {
                display: false,
            },
            ticks: {
                color: colors['📺 Classic'].Neutral.Grey_5.value,
                font: {
                    size: 12,
                },
                padding: 8,
                autoSkipPadding: 24,
                maxRotation: 0,
                includeBounds: false,
            },
        },
        y: {
            border: {
                display: false,
            },
            grid: {
                color: colors['📺 Classic'].Neutral.Grey_2.value,
                tickColor: 'transparent',
                tickLength: 16,
            },
            ticks: {
                callback: (value) => {
                    if (typeof value === 'number') {
                        return NUMBER_TICK_FORMATTER.format(value)
                    }
                    return value
                },
                color: colors['📺 Classic'].Neutral.Grey_5.value,
                font: {
                    size: 12,
                },
            },
            suggestedMin: 0,
        },
    },
    plugins: {
        filler: {
            propagate: false,
        },
        legend: {
            display: false,
        },
        tooltip: {
            enabled: false,
        },
    },
    maintainAspectRatio: false,
}

export default function LineChart({
    data,
    hasBackground,
    displayLegend = false,
}: Props) {
    const [chartArea, setChartArea] = useState<ChartArea>()
    const [chartContext, setChartContext] = useState<CanvasRenderingContext2D>()

    const formattedData = useMemo<ChartData<'line'>>(() => {
        const labels = Array.from(
            new Set(
                data.reduce(
                    (acc: string[], item) => [
                        ...acc,
                        ...item.values.map((value) => value.x),
                    ],
                    []
                )
            )
        )

        return {
            labels,
            datasets: data.map((item, index) => {
                const color = STAT_COLORS[index]
                const background = hasBackground
                    ? getGradient(color, chartArea, chartContext)
                    : 'transparent'

                return {
                    borderColor: color,
                    fill: 'origin',
                    backgroundColor: background,
                    label: item.label,
                    data: item.values as any as Point[],
                }
            }),
        }
    }, [chartArea, chartContext, data, hasBackground])

    const options = useMemo<ChartOptions<'line'>>(
        () => ({
            ...LINE_OPTIONS,
            plugins: {
                ...LINE_OPTIONS.plugins,
                legend: {display: displayLegend},
            },
            onResize: (chart) => {
                setChartArea(chart.chartArea)
                setChartContext(chart.ctx)
            },
        }),
        [displayLegend]
    )

    return (
        <div className={css.wrapper}>
            <Line
                data={formattedData}
                options={options}
                ref={(chart: Chart<'line'> | null | undefined) => {
                    setChartContext(chart?.ctx)
                    setChartArea(chart?.chartArea)
                }}
            />
        </div>
    )
}
