import {Map, List} from 'immutable'
import React, {Component} from 'react'

import _isEqual from 'lodash/isEqual'
import {Bar} from 'react-chartjs-2'

import {
    colors as colorsConfig,
    chartMaxHeight,
} from '../../../../../config/stats'
import Legend from '../Legend/Legend'

type Props = {
    data: Map<any, any>
    config: Map<any, any>
    legend?: Map<any, any>
}

export class BarStat extends Component<Props> {
    render() {
        const {data, config, legend} = this.props
        const datasets = (data.get('lines') as List<any>)
            .map((line: Map<any, any>, index) => {
                const lineName = line.get('name')

                return {
                    label:
                        config.getIn(['lines', lineName, 'label']) || lineName,
                    data: (line.get('data') as Map<any, any>).toJS(),
                    backgroundColor:
                        config.getIn(['lines', lineName, 'color']) ||
                        colorsConfig[index!],
                }
            })
            .toArray()
        const legendLabels = datasets.map((dataset) => ({
            name: dataset.label,
            background: dataset.backgroundColor,
        }))

        return (data.get('lines') as List<any>).isEmpty() ? (
            <div className="text-muted">There is no data for this period.</div>
        ) : (
            <div>
                <div className="mb-4">
                    <Legend labels={legendLabels} />
                </div>
                {
                    // Bar chart needs to be alone inside a div otherwise it grows
                    // indefinitely when the window is resized
                }
                <div>
                    <Bar
                        type="bar"
                        height={chartMaxHeight}
                        data={{
                            labels: (
                                data.getIn(['axes', 'x']) as List<any>
                            ).toJS(),
                            datasets: datasets,
                        }}
                        options={(
                            config.get('options') as (
                                legend: Map<any, any>
                            ) => Record<string, unknown>
                        )(legend!)}
                    />
                </div>
            </div>
        )
    }
}

// Use memo to prevent redrawing on state change
export default React.memo(BarStat, (prev, next) => _isEqual(prev, next))
