import React, {PropTypes} from 'react'
import {Line} from 'react-chartjs-2'
import {colors as colorsConfig, chartMaxHeight} from '../../../../../config/stats'

export default class LineStat extends React.Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        legend: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
    }

    render() {
        const {data, config, legend} = this.props
        const datasets = data.get('lines').map((line, index) => {
            const lineName = line.get('name')

            return {
                label: config.getIn(['lines', lineName, 'label']) || lineName,
                data: line.get('data').toJS(),
                backgroundColor: config.getIn(['lines', lineName, 'color']) || colorsConfig[index]
            }
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
