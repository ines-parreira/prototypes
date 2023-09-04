import {Chart, ChartArea, ChartData, ChartOptions, TooltipItem} from 'chart.js'
import React, {useMemo, useState} from 'react'
import {Line} from 'react-chartjs-2'

import colors from 'assets/tokens/colors.json'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import Legend from 'pages/stats/Legend'
import css from './LineChart.less'
import {TwoDimensionalDataItem} from './types'
import {getGradient, renderTickLabelAsNumber} from './utils'

const STAT_COLORS = Object.freeze([
    colors['📺 Classic'].Main.Primary.value,
    colors['📺 Classic'].Feedback.Warning.value,
    colors['📺 Classic'].Feedback.Success.value,
    colors['📺 Classic'].Feedback.Error.value,
])

type Props = {
    data: TwoDimensionalDataItem[]
    hasBackground?: boolean
    yLabel?: string
    renderYTickLabel?: (value: number | string) => string
    isLoading?: boolean
    displayLegend?: boolean
    _displayLegacyTooltip?: boolean
    _renderLegacyTooltipLabel?: (tooltipItem: TooltipItem<'line'>) => string
}

const LINE_OPTIONS: ChartOptions<'line'> = {
    elements: {
        point: {
            pointStyle: 'circle',
        },
        line: {
            borderWidth: 1,
            cubicInterpolationMode: 'default',
            tension: 0.5,
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
            title: {
                display: false,
            },
            border: {
                display: false,
            },
            grid: {
                color: colors['📺 Classic'].Neutral.Grey_2.value,
                tickColor: 'transparent',
                tickLength: 16,
            },
            ticks: {
                color: colors['📺 Classic'].Neutral.Grey_5.value,
                font: {
                    size: 12,
                },
            },
            suggestedMin: 0,
            beginAtZero: true,
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
            callbacks: {
                title: () => undefined, // reset legacy tooltip title
            },
        },
    },
    maintainAspectRatio: false,
}

export default function LineChart({
    data,
    hasBackground,
    yLabel,
    renderYTickLabel = renderTickLabelAsNumber,
    isLoading = false,
    displayLegend = false,
    _displayLegacyTooltip = false,
    _renderLegacyTooltipLabel,
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
                    data: item.values.map((value) => value.y),
                    pointBackgroundColor: color,
                }
            }),
        }
    }, [chartArea, chartContext, data, hasBackground])

    const options = useMemo<ChartOptions<'line'>>(
        () => ({
            ...LINE_OPTIONS,
            scales: {
                ...LINE_OPTIONS.scales,
                y: {
                    ...LINE_OPTIONS.scales?.y,
                    title: {
                        ...LINE_OPTIONS.scales?.y?.title,
                        display: !!yLabel,
                        text: yLabel,
                    },
                    ticks: {
                        ...LINE_OPTIONS.scales?.y?.ticks,
                        callback: renderYTickLabel,
                    },
                },
            },
            plugins: {
                ...LINE_OPTIONS.plugins,
                tooltip: {
                    ...LINE_OPTIONS.plugins?.tooltip,
                    enabled: _displayLegacyTooltip,
                    callbacks: {
                        ...LINE_OPTIONS.plugins?.tooltip?.callbacks,
                        label: _renderLegacyTooltipLabel,
                    },
                },
            },
            resizeDelay: 1000,
            onResize: (chart) => {
                setChartArea(chart.chartArea)
                setChartContext(chart.ctx)
            },
        }),
        [
            yLabel,
            renderYTickLabel,
            _displayLegacyTooltip,
            _renderLegacyTooltipLabel,
        ]
    )

    if (isLoading) {
        return <Skeleton height={250} />
    }

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
            {displayLegend && (
                <Legend
                    className={css.legend}
                    items={data.map(({label}, index) => ({
                        label,
                        color: STAT_COLORS[index],
                    }))}
                />
            )}
        </div>
    )
}
