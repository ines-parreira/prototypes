import {
    Chart,
    ChartArea,
    ChartData,
    ChartOptions,
    Scale,
    ScriptableScaleContext,
    TooltipItem,
} from 'chart.js'

import classNames from 'classnames'
import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {fromJS, Map} from 'immutable'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Line} from 'react-chartjs-2'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import Legend from 'pages/stats/Legend'
import {withThemedColorTokens} from 'theme/withThemedColorTokens'
import {GreyArea} from './ChartPluginGreyArea'
import {ChartTooltip} from './ChartTooltip'
import css from './LineChart.less'
import {LineChartTooltip} from './LineChartTooltip'
import {TwoDimensionalDataItem} from './types'
import {useCustomTooltip} from './useCustomTooltip'
import {getGradient, renderTickLabelAsNumber} from './utils'

interface ChartColors {
    Main: {
        Primary: {
            value: string
        }
    }
    Feedback: {
        Error: {value: string}
        Success: {value: string}
        Warning: {value: string}
    }
    Neutral: {
        Grey_2: {
            value: string
        }
        Grey_5: {
            value: string
        }
    }
}

type Props = {
    data: TwoDimensionalDataItem[]
    options?: ChartOptions<'line'>
    hasBackground?: boolean
    yLabel?: string
    renderYTickLabel?: (value: number | string) => string
    isLoading?: boolean
    displayLegend?: boolean
    toggleLegend?: boolean
    defaultDatasetVisibility?: Record<number, boolean | undefined> | null
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
    wrapperclassNames?: string
    skeletonHeight?: number
    colorTokens?: ChartColors
}

const fallbackColorTokens = {
    Main: {
        Primary: {
            value: colors['📺 Classic'].Main.Primary.value,
        },
    },
    Feedback: {
        Error: {value: colors['📺 Classic'].Feedback.Error.value},
        Success: {value: colors['📺 Classic'].Feedback.Success.value},
        Warning: {value: colors['📺 Classic'].Feedback.Warning.value},
    },
    Neutral: {
        Grey_2: {
            value: colors['📺 Classic'].Neutral.Grey_2.value,
        },
        Grey_5: {
            value: colors['📺 Classic'].Neutral.Grey_5.value,
        },
    },
}

const LINE_OPTIONS = (
    colorTokens: ChartColors
): DeepPartial<ChartOptions<'line'>> =>
    fromJS({
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
                grid: {
                    display: false,
                },
                ticks: {
                    color: colorTokens.Neutral.Grey_5.value,
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
                    color: colorTokens.Neutral.Grey_2.value,
                    tickColor: 'transparent',
                    tickLength: 16,
                },
                ticks: {
                    color: colorTokens.Neutral.Grey_5.value,
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
        resizeDelay: 1000,
    }) as DeepPartial<ChartOptions<'line'>>

export const CHART_TOOLTIP_TARGET = 'lineChartTooltip'

function LineChart({
    data,
    options,
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
    yAxisBeginAtZero = true,
    legendOnLeft = false,
    toggleLegend = false,
    renderXTickLabel,
    yAxisScale = {},
    wrapperclassNames,
    defaultDatasetVisibility = null,
    skeletonHeight = 250,
    colorTokens = fallbackColorTokens,
}: Props) {
    const [chart, setChart] = useState<Chart>()
    const [chartArea, setChartArea] = useState<ChartArea>()
    const [chartContext, setChartContext] = useState<CanvasRenderingContext2D>()
    const {customTooltip, tooltipData, tooltipStyle} = useCustomTooltip()

    const statColors: string[] = useMemo(
        () => [
            colorTokens.Main.Primary.value,
            colorTokens.Feedback.Warning.value,
            colorTokens.Feedback.Success.value,
            colorTokens.Feedback.Error.value,
        ],
        [
            colorTokens.Feedback.Error.value,
            colorTokens.Feedback.Success.value,
            colorTokens.Feedback.Warning.value,
            colorTokens.Main.Primary.value,
        ]
    )

    const chartColors = useCallback(
        (index: number) => customColors?.[index] || statColors[index],
        [customColors, statColors]
    )
    const [linesVisibility, setLinesVisibility] = useState<Record<
        number,
        boolean | undefined
    > | null>(defaultDatasetVisibility)

    useEffect(
        () => setLinesVisibility(defaultDatasetVisibility),
        [defaultDatasetVisibility]
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
                    ...(defaultDatasetVisibility && {
                        hidden: !defaultDatasetVisibility[index],
                    }),
                }
            }),
        }
    }, [
        chartArea,
        chartContext,
        data,
        hasBackground,
        chartColors,
        defaultDatasetVisibility,
    ])

    const lineOptions = useMemo(
        () =>
            (LINE_OPTIONS(colorTokens) as Map<any, any>).mergeDeep(
                {
                    scales: {
                        y: {
                            title: {
                                display: !!yLabel,
                                text: yLabel,
                            },
                            ticks: {
                                callback: renderYTickLabel,
                            },
                            beginAtZero: yAxisBeginAtZero,
                            grid: {
                                color: (context: ScriptableScaleContext) => {
                                    if (
                                        context.tick.value === 0 &&
                                        data.length === 0
                                    ) {
                                        return colorTokens.Main.Primary.value
                                    }

                                    return colorTokens.Neutral.Grey_2.value
                                },
                            },
                            ...yAxisScale,
                        },
                        x: {
                            ticks: {
                                ...(renderXTickLabel
                                    ? {callback: renderXTickLabel}
                                    : {}),
                            },
                        },
                    },
                    plugins: {
                        tooltip: {
                            enabled: _displayLegacyTooltip,
                            callbacks: {
                                label: _renderLegacyTooltipLabel,
                            },
                            position: 'nearest',
                            intersect: false,
                            mode: 'index',
                            external: customTooltip,
                        },
                        greyArea,
                    },
                    elements: {
                        line: {
                            tension: !isCurvedLine
                                ? 0
                                : LINE_OPTIONS(colorTokens).elements?.line
                                      ?.tension,
                        },
                    },
                    onResize: (chart: Chart) => {
                        setChartArea(chart.chartArea)
                        setChartContext(chart.ctx)
                    },
                },
                fromJS(options)
            ),
        [
            colorTokens,
            yLabel,
            renderYTickLabel,
            yAxisBeginAtZero,
            yAxisScale,
            renderXTickLabel,
            _displayLegacyTooltip,
            _renderLegacyTooltipLabel,
            customTooltip,
            greyArea,
            isCurvedLine,
            options,
            data.length,
        ]
    )

    if (isLoading) {
        return <Skeleton height={skeletonHeight} />
    }

    return (
        <div className={classNames(css.wrapper, wrapperclassNames)}>
            <div className={css.container}>
                <Line
                    id={CHART_TOOLTIP_TARGET}
                    data={formattedData}
                    options={lineOptions.toJS()}
                    ref={(chart: Chart<'line'> | null | undefined) => {
                        setChartContext(chart?.ctx)
                        setChartArea(chart?.chartArea)
                        chart && setChart(chart)
                    }}
                />
                {!_displayLegacyTooltip && (
                    <ChartTooltip
                        target={CHART_TOOLTIP_TARGET}
                        tooltipStyle={tooltipStyle}
                        title={tooltipData?.title}
                    >
                        {tooltipData && (
                            <LineChartTooltip tooltip={tooltipData} />
                        )}
                    </ChartTooltip>
                )}
            </div>
            {displayLegend && (
                <Legend
                    toggleLegend={toggleLegend}
                    className={classNames(css.legend, {
                        [css.legendOnLeft]: legendOnLeft,
                    })}
                    items={data.map(({label, tooltip}, index) => ({
                        label,
                        tooltip,
                        color: chartColors(index),
                        ...(toggleLegend && {
                            isChecked:
                                linesVisibility?.[index] ??
                                chart?.isDatasetVisible(index),
                            onChange: () => {
                                chart?.setDatasetVisibility(
                                    index,
                                    !chart.isDatasetVisible(index)
                                )
                                setLinesVisibility((prevValue) => ({
                                    ...prevValue,
                                    [index]: chart?.isDatasetVisible(index),
                                }))
                                chart?.update()
                            },
                        }),
                    }))}
                />
            )}
        </div>
    )
}

export default withThemedColorTokens<Props>(LineChart)
