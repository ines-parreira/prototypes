import React, {useMemo} from 'react'
import {
    SankeyDataPoint,
    TooltipItem,
    ScriptableContext,
    ChartOptions,
} from 'chart.js'
import {Map} from 'immutable'
import _isEqual from 'lodash/isEqual'
import _merge from 'lodash/merge'
import ChartComponent from 'react-chartjs-2'

import {chartMaxHeight} from '../../../../../config/stats'

type Props = {
    data: Map<any, any>
    config: Map<any, any>
    legend: Map<any, any>
}

export function SankeyStat({data, config, legend}: Props) {
    const hasData = useMemo(() => {
        return (
            !data.isEmpty() &&
            data.some((value: Map<any, any>) => !!value.get('flow'))
        )
    }, [data])

    const sankeyData = useMemo(() => {
        const colorMap = config.get('colorMap') as Map<any, any>
        return {
            datasets: [
                {
                    data: data.toJS(),
                    labels: legend
                        ? (legend.get('labels') as Map<any, any>).toJS()
                        : {},
                    colorFrom: (ctx: ScriptableContext<'sankey'>) => {
                        return colorMap.get(
                            ctx.dataset.data[ctx.dataIndex].from
                        ) as string
                    },
                    colorTo: (ctx: ScriptableContext<'sankey'>) =>
                        (colorMap.get(
                            ctx.dataset.data[ctx.dataIndex].to
                        ) as string) || '#00ff00',
                    colorMode: 'gradient',
                    borderWidth: 0,
                    color: '#1D365C',
                    priority: (config.get('priority') as Map<any, any>)?.toJS(),
                },
            ],
        }
    }, [data, config])

    const options = config.get('options')
        ? (config.get('options') as () => ChartOptions)()
        : {}

    return (
        <div>
            {!hasData ? (
                <div className="text-muted">
                    There is no data for this period.
                </div>
            ) : (
                <ChartComponent
                    type={'sankey'}
                    data={sankeyData}
                    height={chartMaxHeight}
                    options={_merge(options, {
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    title: (
                                        tooltipItems: TooltipItem<any>[]
                                    ) => {
                                        const data = tooltipItems[0].dataset
                                            .data as SankeyDataPoint[]
                                        const idx = tooltipItems[0].dataIndex
                                        const {from, to} = data[idx]
                                        const labels = legend
                                            ? ((
                                                  legend.get('labels') as Map<
                                                      any,
                                                      any
                                                  >
                                              ).toJS() as {
                                                  [key: string]: string
                                              })
                                            : null
                                        return `${
                                            labels ? labels[from] : from
                                        } ➞ ${labels ? labels[to] : to}`
                                    },
                                    label: (tooltipItem: TooltipItem<any>) => {
                                        const data = tooltipItem.dataset
                                            .data as SankeyDataPoint[]
                                        const {from, flow} =
                                            data[tooltipItem.dataIndex]
                                        const totalFrom = data
                                            .filter((val) => val.from === from)
                                            .map((val) => val.flow)
                                            .reduce((acc, val) => acc + val)

                                        const ratio = (flow / totalFrom) * 100
                                        return `${totalFrom} ➞ ${flow} (${ratio.toFixed(
                                            0
                                        )} %)`
                                    },
                                },
                            },
                        },
                    })}
                />
            )}
        </div>
    )
}

export default React.memo(SankeyStat, (prev, next) => _isEqual(prev, next))
