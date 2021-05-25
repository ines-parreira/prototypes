import React, {Component} from 'react'
import {ChartOptions} from 'chart.js'
import {Line} from 'react-chartjs-2'
import moment from 'moment'
import {Map, List} from 'immutable'

import Legend from '../Legend/Legend.js'
import {
    colors as colorsConfig,
    chartMaxHeight,
    chartPointRadius,
} from '../../../../../config/stats'

type Props = {
    data: Map<any, any>
    legend: Map<any, any>
    config: Map<any, any>
    meta: Map<any, any>
}

export default class LineStat extends Component<Props> {
    render() {
        const {data, config, legend, meta} = this.props
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
                    />
                </div>
            </div>
        )
    }
}
