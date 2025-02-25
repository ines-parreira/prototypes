import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
    Chart,
    ChartOptions,
    Scale,
    ScriptableScaleContext,
    TooltipItem,
} from 'chart.js'
import classNames from 'classnames'
import { fromJS, Map } from 'immutable'
import { Bar } from 'react-chartjs-2'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { GreyArea } from 'pages/stats/ChartPluginGreyArea'
import { ChartTooltip } from 'pages/stats/ChartTooltip'
import css from 'pages/stats/common/components/charts/Chart.less'
import { ChartLegend } from 'pages/stats/common/components/charts/ChartLegend'
import { ChartTooltipContent } from 'pages/stats/common/components/charts/ChartTooltipContent'
import {
    chartColorsFallbackTokens,
    OPTIONS,
} from 'pages/stats/common/components/charts/config'
import { ChartColors } from 'pages/stats/common/components/charts/types'
import type { AnalyticsTheme } from 'pages/stats/common/theme'
import { withAnalyticsTheme } from 'pages/stats/common/theme'
import { useCustomTooltip } from 'pages/stats/common/useCustomTooltip'
import { TwoDimensionalDataItem } from 'pages/stats/types'
import { renderTickLabelAsNumber } from 'pages/stats/utils'

type Props = {
    data: TwoDimensionalDataItem[]
    options?: ChartOptions<'bar'>
    hasBackground?: boolean
    yLabel?: string
    renderYTickLabel?: (value: number | string) => string
    isLoading?: boolean
    displayLegend?: boolean
    toggleLegend?: boolean
    defaultDatasetVisibility?: Record<number, boolean | undefined> | null
    _displayLegacyTooltip?: boolean
    _renderLegacyTooltipLabel?: (tooltipItem: TooltipItem<'bar'>) => string
    greyArea?: GreyArea
    customColors?: string[]
    isCurvedLine?: boolean
    yAxisBeginAtZero?: boolean
    legendOnLeft?: boolean
    renderXTickLabel?: (
        this: Scale,
        value: number | string,
        index: number,
    ) => string
    yAxisScale?: {
        min?: number
        max?: number
    }
    wrapperclassNames?: string
    skeletonHeight?: number
    colorTokens?: ChartColors & AnalyticsTheme
    isStacked?: boolean
}

export const CHART_TOOLTIP_TARGET = 'barChartTooltip'

export function BarChart({
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
    colorTokens = chartColorsFallbackTokens,
    isStacked = false,
}: Props) {
    const [chart, setChart] = useState<Chart>()
    const { customTooltip, tooltipData, tooltipStyle } = useCustomTooltip()

    const statColors: string[] = useMemo(() => {
        const colors = colorTokens.analytics.data
        return [colors.blue.value, colors.yellow.value, colors.grey.value]
    }, [colorTokens])

    const chartColors = useCallback(
        (index: number) => customColors?.[index] || statColors[index],
        [customColors, statColors],
    )

    const [linesVisibility, setLinesVisibility] = useState<Record<
        number,
        boolean | undefined
    > | null>(defaultDatasetVisibility)

    useEffect(
        () => setLinesVisibility(defaultDatasetVisibility),
        [defaultDatasetVisibility],
    )

    const formattedData = useMemo(() => {
        const labels = Array.from(
            new Set(
                data.reduce(
                    (acc: string[], item) => [
                        ...acc,
                        ...item.values.map((value) => value.x),
                    ],
                    [],
                ),
            ),
        )

        return {
            labels,
            datasets: data.map((item, index) => {
                const color = chartColors(index)
                const background = hasBackground ? color : 'transparent'

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
                    borderRadius: 4,
                    minBarLength: 2,
                }
            }),
        }
    }, [data, hasBackground, chartColors, defaultDatasetVisibility])

    const barOptions = useMemo(
        () =>
            (OPTIONS(colorTokens) as Map<any, any>).mergeDeep(
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
                            stacked: isStacked,
                            ...yAxisScale,
                        },
                        x: {
                            ticks: {
                                ...(renderXTickLabel
                                    ? { callback: renderXTickLabel }
                                    : {}),
                            },
                            stacked: isStacked,
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
                                : (
                                      OPTIONS(colorTokens) as DeepPartial<
                                          ChartOptions<'bar'>
                                      >
                                  ).elements?.line?.tension,
                        },
                    },
                },
                fromJS(options),
            ),
        [
            colorTokens,
            yLabel,
            renderYTickLabel,
            yAxisBeginAtZero,
            isStacked,
            yAxisScale,
            renderXTickLabel,
            _displayLegacyTooltip,
            _renderLegacyTooltipLabel,
            customTooltip,
            greyArea,
            isCurvedLine,
            options,
            data.length,
        ],
    )

    if (isLoading) {
        return <Skeleton height={skeletonHeight} />
    }

    return (
        <div className={classNames(css.wrapper, wrapperclassNames)}>
            <div className={css.container}>
                <Bar
                    id={CHART_TOOLTIP_TARGET}
                    data={formattedData}
                    options={barOptions.toJS()}
                    ref={(chart: Chart<'bar'> | null | undefined) => {
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
                            <ChartTooltipContent tooltip={tooltipData} />
                        )}
                    </ChartTooltip>
                )}
            </div>
            <ChartLegend
                data={data}
                chartColors={chartColors}
                linesVisibility={linesVisibility}
                setLinesVisibility={setLinesVisibility}
                chart={chart}
                displayLegend={displayLegend}
                toggleLegend={toggleLegend}
                legendOnLeft={legendOnLeft}
            />
        </div>
    )
}

export default withAnalyticsTheme<Props>(BarChart)
