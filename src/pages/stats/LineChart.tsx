import {
    Chart,
    ChartArea,
    ChartData,
    ChartOptions,
    Scale,
    TooltipItem,
} from 'chart.js'
import React, {useCallback, useMemo, useState} from 'react'
import {Line} from 'react-chartjs-2'

import classNames from 'classnames'
import colors from 'assets/tokens/colors.json'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import Legend from 'pages/stats/Legend'
import css from './LineChart.less'
import {TwoDimensionalDataItem} from './types'
import {getGradient, renderTickLabelAsNumber} from './utils'
import {GreyArea} from './ChartPluginGreyArea'

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
    toggleLegend?: boolean
    _displayLegacyTooltip?: boolean
    _renderLegacyTooltipLabel?: (tooltipItem: TooltipItem<'line'>) => string
    greyArea?: GreyArea
    customColors?: string[]
    isCurvedLine?: boolean
    yAxisBeginAtZero?: boolean
    legendOnLeft?: boolean
    renderXTickLabel?: (
        this: Scale,
        value: number | string,
        index: number
    ) => string
    yAxisScale?: {
        min?: number
        max?: number
    }
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
                maxTicksLimit: 10,
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
    greyArea,
    customColors,
    isCurvedLine = true,
    yAxisBeginAtZero = false,
    legendOnLeft = false,
    toggleLegend = false,
    renderXTickLabel,
    yAxisScale = {},
}: Props) {
    const [chart, setChart] = useState<Chart>()
    const [chartArea, setChartArea] = useState<ChartArea>()
    const [chartContext, setChartContext] = useState<CanvasRenderingContext2D>()
    const chartColors = useCallback(
        (index: number) => customColors?.[index] || STAT_COLORS[index],
        [customColors]
    )

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
                const color = chartColors(index)
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
    }, [chartArea, chartContext, data, hasBackground, chartColors])

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
                    beginAtZero: yAxisBeginAtZero,
                    ...yAxisScale,
                },
                x: {
                    ...LINE_OPTIONS.scales?.x,
                    ticks: {
                        ...LINE_OPTIONS.scales?.x?.ticks,
                        ...(renderXTickLabel
                            ? {callback: renderXTickLabel}
                            : {}),
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
                greyArea,
            },
            resizeDelay: 1000,
            onResize: (chart) => {
                setChartArea(chart.chartArea)
                setChartContext(chart.ctx)
            },
            elements: {
                ...LINE_OPTIONS.elements,
                line: {
                    ...LINE_OPTIONS.elements?.line,
                    tension: !isCurvedLine
                        ? 0
                        : LINE_OPTIONS.elements?.line?.tension,
                },
            },
        }),
        [
            yLabel,
            renderYTickLabel,
            _displayLegacyTooltip,
            _renderLegacyTooltipLabel,
            isCurvedLine,
            yAxisBeginAtZero,
            greyArea,
            renderXTickLabel,
            yAxisScale,
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
                    chart && setChart(chart)
                }}
            />
            {displayLegend && (
                <Legend
                    toggleLegend={toggleLegend}
                    className={classNames({
                        [css.legend]: true,
                        [css.legendOnLeft]: legendOnLeft,
                    })}
                    items={data.map(({label}, index) => ({
                        label,
                        color: chartColors(index),
                        index,
                    }))}
                    chart={chart}
                />
            )}
        </div>
    )
}
