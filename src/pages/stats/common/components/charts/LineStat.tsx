import React, {Component, ComponentProps} from 'react'
import {ChartOptions} from 'chart.js'
import {Line} from 'react-chartjs-2'
import moment from 'moment'
import {Map, List} from 'immutable'
import _flatten from 'lodash/flatten'
import _isEqual from 'lodash/isEqual'
import {connect, ConnectedProps} from 'react-redux'

import Legend from '../Legend/Legend'
import {
    colors as colorsConfig,
    chartMaxHeight,
    chartPointRadius,
    StatConfig,
} from '../../../../../config/stats'
import {RootState} from '../../../../../state/types'
import {getBusinessHoursRangesByUserTimezone} from '../../../../../state/currentAccount/selectors'

import {highlightTimeRanges} from './plugins'

type Props = {
    data: Map<any, any>
    legend: Map<any, any>
    config: Map<any, any>
    meta: Map<any, any>
} & ConnectedProps<typeof connector>

export class LineStatContainer extends Component<Props> {
    _getOptions = (legend: Map<any, any>) => {
        const {config, businessRanges} = this.props
        const defaultOptions = (config.get('options') as (
            legend: Map<any, any>
        ) => ChartOptions)(legend)
        const formattedBusinessRanges = businessRanges?.map((range) => [
            range[0].add(30, 'minutes').startOf('hour'),
            range[1].add(30, 'minutes').startOf('hour'),
        ])
        return (config.get('hasBusinessHoursHighlight') && businessRanges
            ? {
                  ...defaultOptions,
                  plugins: {
                      highlight_time_ranges: {
                          timeRanges: formattedBusinessRanges,
                      },
                  },
              }
            : defaultOptions) as StatConfig
    }

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
        const extraProps = {
            plugins: _flatten([
                config.get('hasBusinessHoursHighlight') && businessRanges
                    ? [highlightTimeRanges]
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
                        type="line"
                        height={chartMaxHeight}
                        data={{
                            labels: (data.getIn(['axes', 'x']) as List<
                                any
                            >).toJS(),
                            datasets: datasets,
                        }}
                        options={this._getOptions(legend)}
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

// Use memo to prevent redrawing on state change
export default connector(
    React.memo(LineStatContainer, (prev, next) => _isEqual(prev, next))
)
