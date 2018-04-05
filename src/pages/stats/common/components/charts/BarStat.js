import React, {PropTypes} from 'react'
import {Bar} from 'react-chartjs-2'
import {colors as colorsConfig, chartMaxHeight} from '../../../../../config/stats'
import Legend from '../Legend'

export default class BarStat extends React.Component {
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
                    <Bar
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
