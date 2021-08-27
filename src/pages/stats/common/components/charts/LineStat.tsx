import React, {Component, ComponentProps} from 'react'
import {ChartOptions} from 'chart.js'
import {Line} from 'react-chartjs-2'
import moment from 'moment'
import {Map, List} from 'immutable'
import _flatten from 'lodash/flatten'
import {connect, ConnectedProps} from 'react-redux'

import Legend from '../Legend/Legend'
import {
    colors as colorsConfig,
    chartMaxHeight,
    chartPointRadius,
} from '../../../../../config/stats'
import {RootState} from '../../../../../state/types'
import {getBusinessHoursRangesByUserTimezone} from '../../../../../state/currentAccount/selectors'

type Props = {
    data: Map<any, any>
    legend: Map<any, any>
    config: Map<any, any>
    meta: Map<any, any>
} & ConnectedProps<typeof connector>

export class LineStatContainer extends Component<Props> {
    render() {
        const {data, config, legend, meta, businessRanges} = this.props
        const start = moment(meta.get('start_datetime'))
        const end = moment(meta.get('end_datetime'))
        const isOneDayPeriod =
            start.format('YYYY MM DD') === end.format('YYYY MM DD')
        const datasets = (data.get('lines') as List<any>)
            .map((line: Map<any, any>, index) => {
                const lineName = line.get('name')
                const {backgroundColor, label, ...lineConfig} = (config.getIn([
                    'lines',
                    lineName,
                ]) as Map<any, any>).toJS() as Record<string, unknown>

                const data: Record<string, unknown> = {
                    label: label || lineName,
                    backgroundColor: backgroundColor || colorsConfig[index!],
                    cubicInterpolationMode: 'default',
                    lineTension: 0,
                    data: (line.get('data') as Map<any, any>).toJS(),
                    ...lineConfig,
                }

                if (isOneDayPeriod) {
                    data.pointRadius = chartPointRadius
                }

                return data
            })
            .toArray()
        const legendLabels = datasets.map((dataset) => ({
            name: dataset.label as string,
            background: dataset.backgroundColor as string,
        }))
        const roundedRanges = businessRanges?.map((range) => [
            range[0].add(30, 'minutes').startOf('hour'),
            range[1].add(30, 'minutes').startOf('hour'),
        ])
        const extraProps = {
            plugins: _flatten([
                config.get('hasBusinessHoursHighlight') && roundedRanges
                    ? [
                          {
                              id: 'custom_canvas_background_color',
                              afterDraw: (
                                  chart: Chart & {
                                      scales: {
                                          ['x-axis-0']: {
                                              left: number
                                              width: number
                                              _gridLineItems: {x1: number}[]
                                              _ticks: {value: number}[]
                                          }
                                          ['y-axis-0']: {
                                              height: number
                                              top: number
                                          }
                                      }
                                  }
                              ) => {
                                  roundedRanges.map((range) => {
                                      if (!chart.canvas) {
                                          return
                                      }
                                      const ctx = chart.canvas.getContext(
                                          '2d'
                                      ) as CanvasRenderingContext2D
                                      ctx.save()
                                      const startIndex = chart.scales[
                                          'x-axis-0'
                                      ]._ticks.findIndex((item) => {
                                          return (
                                              moment
                                                  .unix(item.value)
                                                  .format('h a') ===
                                              range[0].format('h a')
                                          )
                                      })
                                      const endIndex = chart.scales[
                                          'x-axis-0'
                                      ]._ticks.findIndex((item) => {
                                          return (
                                              moment
                                                  .unix(item.value)
                                                  .format('h a') ===
                                              range[1].format('h a')
                                          )
                                      })
                                      ctx.globalCompositeOperation =
                                          'destination-over'
                                      ctx.fillStyle = '#ffffff'
                                      if (endIndex >= startIndex) {
                                          ctx.fillRect(
                                              chart.scales['x-axis-0']
                                                  ._gridLineItems[startIndex]
                                                  .x1,
                                              chart.scales['y-axis-0'].top,
                                              chart.scales['x-axis-0']
                                                  ._gridLineItems[endIndex].x1 -
                                                  chart.scales['x-axis-0']
                                                      ._gridLineItems[
                                                      startIndex
                                                  ].x1,
                                              chart.scales['y-axis-0'].height
                                          )
                                      } else {
                                          ctx.fillRect(
                                              chart.scales['x-axis-0']
                                                  ._gridLineItems[startIndex]
                                                  .x1,
                                              chart.scales['y-axis-0'].top,
                                              chart.scales['x-axis-0']
                                                  ._gridLineItems[
                                                  chart.scales['x-axis-0']
                                                      ._ticks.length - 1
                                              ].x1 -
                                                  chart.scales['x-axis-0']
                                                      ._gridLineItems[
                                                      startIndex
                                                  ].x1,
                                              chart.scales['y-axis-0'].height
                                          )
                                          ctx.fillRect(
                                              chart.scales['x-axis-0']
                                                  ._gridLineItems[0].x1,
                                              chart.scales['y-axis-0'].top,
                                              chart.scales['x-axis-0']
                                                  ._gridLineItems[endIndex].x1 -
                                                  chart.scales['x-axis-0']
                                                      ._gridLineItems[0].x1,
                                              chart.scales['y-axis-0'].height
                                          )
                                      }
                                      ctx.restore()
                                  })
                                  if (!chart.canvas) {
                                      return
                                  }
                                  const ctx = chart.canvas.getContext(
                                      '2d'
                                  ) as CanvasRenderingContext2D
                                  ctx.save()
                                  ctx.globalCompositeOperation =
                                      'destination-over'
                                  ctx.fillStyle = '#f4f5f7'
                                  ctx.fillRect(
                                      chart.scales['x-axis-0'].left,
                                      chart.scales['y-axis-0'].top,
                                      chart.scales['x-axis-0'].width,
                                      chart.scales['y-axis-0'].height
                                  )
                                  ctx.restore()
                              },
                          },
                      ]
                    : [],
            ]),
        } as Partial<ComponentProps<typeof Line>>

        return (
            <div>
                <div className="mb-4">
                    <Legend labels={legendLabels} />
                </div>
                {
                    // Bar chart needs to be alone inside a div otherwise it grows
                    // indefinitely when the window is resized
                }
                <div>
                    <Line
                        height={chartMaxHeight}
                        data={{
                            labels: (data.getIn(['axes', 'x']) as List<
                                any
                            >).toJS(),
                            datasets: datasets,
                        }}
                        options={(config.get('options') as (
                            legend: Map<any, any>
                        ) => ChartOptions)(legend)}
                        {...extraProps}
                    />
                </div>
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    businessRanges: getBusinessHoursRangesByUserTimezone(state),
}))

export default connector(LineStatContainer)
