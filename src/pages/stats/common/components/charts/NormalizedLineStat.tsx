import {Col, Row} from 'reactstrap'
import React from 'react'
import {Map, List} from 'immutable'
import _isEqual from 'lodash/isEqual'
import {Line} from 'react-chartjs-2'

import {
    colors as colorsConfig,
    chartMaxHeight,
} from '../../../../../config/stats'

import css from './NormalizedLineStat.less'

type Props = {
    data: Map<any, any>
    config: Map<any, any>
    legend?: Map<any, any>
}

const NormalizedLineStat = ({data, config, legend}: Props) => {
    const datasets = (data.get('lines') as List<any>)
        .map((line: Map<any, any>, index) => {
            const lineName: string = line.get('name')
            const {label, backgroundColor, ...lineConfig} = (
                config.getIn(['lines', lineName]) as Map<any, any>
            ).toJS() as Record<string, unknown>
            return {
                name: lineName,
                label: (label as string) || lineName,
                data: (line.get('data') as Map<any, any>).toJS(),
                backgroundColor:
                    (backgroundColor as string) || colorsConfig[index!],
                ...lineConfig,
            }
        })
        .toArray()

    const count = (array: number[]) => {
        return array.reduce((acc, cur) => acc + cur, 0)
    }
    return (data.get('lines') as List<any>).isEmpty() ? (
        <div className="text-muted">There is no data for this period.</div>
    ) : (
        <Row>
            <Col lg={9} md={8} sm={12}>
                <div>
                    <Line
                        type="line"
                        height={chartMaxHeight}
                        data={{
                            labels: (
                                data.getIn(['axes', 'x']) as List<any>
                            ).toJS(),
                            datasets,
                        }}
                        options={(
                            config.get('options') as (
                                legend: Map<any, any>
                            ) => Record<string, unknown>
                        )(legend!)}
                    />
                </div>
            </Col>
            <Col lg={3} md={4} sm={12}>
                <div className={css['bar-total-wrapper']}>
                    {datasets.map(({label, backgroundColor, data}) => (
                        <div
                            key={label}
                            className={css['bar-total-data-wrapper']}
                        >
                            <div
                                className={`${css.label} mr-4 mb-2`}
                                key={label}
                            >
                                <span
                                    className={`${css['circle']} mr-2`}
                                    style={{backgroundColor}}
                                />
                                {label}
                            </div>
                            <div className={css['data']}>{count(data)}</div>
                        </div>
                    ))}
                </div>
            </Col>
        </Row>
    )
}

// Use memo to prevent redrawing on state change
export default React.memo(NormalizedLineStat, (prev, next) =>
    _isEqual(prev, next)
)
