import React, {PropTypes} from 'react'
import {Line} from 'react-chartjs-2'
import {colors as colorsConfig, chartMaxHeight, chartPointRadius} from '../../../../../config/stats'
import moment from 'moment'

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
            const data = {
                label: config.getIn(['lines', lineName, 'label']) || lineName,
                cubicInterpolationMode: 'default',
                lineTension: 0,
                data: line.get('data').toJS(),
                backgroundColor: config.getIn(['lines', lineName, 'color']) || colorsConfig[index]
            }

            if (isOneDayPeriod) {
                data.pointRadius = chartPointRadius
            }

            return data
        }).toArray()

        return (
            <Line
                height={chartMaxHeight}
                data={{
                    labels: data.getIn(['axes', 'x']).toJS(),
                    datasets: datasets
                }}
                options={config.get('options')(legend)}
            />
        )
    }
}
