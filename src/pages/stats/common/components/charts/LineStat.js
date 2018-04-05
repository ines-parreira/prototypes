import React, {PropTypes} from 'react'
import {Line} from 'react-chartjs-2'
import moment from 'moment'
import Legend from '../Legend'
import {colors as colorsConfig, chartMaxHeight, chartPointRadius} from '../../../../../config/stats'

export default class LineStat extends React.Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        legend: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired
    }

    render() {
        const {data, config, legend, meta} = this.props
        const start = moment(meta.get('start_datetime'))
        const end = moment(meta.get('end_datetime'))
        const isOneDayPeriod = start.format('YYYY MM DD') === end.format('YYYY MM DD')
        const datasets = data.get('lines').map((line, index) => {
            const lineName = line.get('name')
            const {backgroundColor, label, ...lineConfig} = config.getIn(['lines', lineName]).toJS()

            const data = {
                label: label || lineName,
                backgroundColor: backgroundColor || colorsConfig[index],
                cubicInterpolationMode: 'default',
                lineTension: 0,
                data: line.get('data').toJS(),
                ...lineConfig
            }

            if (isOneDayPeriod) {
                data.pointRadius = chartPointRadius
            }

            return data
        }).toArray()
        const legendLabels = datasets.map((dataset) => ({
            name: dataset.label,
            backgroundColor: dataset.backgroundColor
        }))

        return (
            <div>
                <div className="mb-4">
                    <Legend labels={legendLabels}/>
                </div>
                {
                 // Bar chart needs to be alone inside a div otherwise it grows
                 // indefinitely when the window is resized
                }
                <div>
                    <Line
                        height={chartMaxHeight}
                        data={{
                            labels: data.getIn(['axes', 'x']).toJS(),
                            datasets: datasets
                        }}
                        options={config.get('options')(legend)}
                    />
                </div>
            </div>
        )
    }
}
