import moment from 'moment'
import {Col, Row} from 'reactstrap'
import React from 'react'
import {Map, List} from 'immutable'
import _isEqual from 'lodash/isEqual'
import {Link} from 'react-router-dom'

import {
    colors as colorsConfig,
    chartMaxHeight,
} from '../../../../../config/stats'
import Legend from '../Legend/Legend'
import StatsHelpIcon from '../StatsHelpIcon'
import Tooltip from '../../../../common/components/Tooltip'

import css from './NormalizedBarStat.less'

import {Bar} from 'react-chartjs-2'

type Props = {
    data: Map<any, any>
    config: Map<any, any>
    legend?: Map<any, any>
}

const NormalizedBarStat = ({data, config, legend}: Props) => {
    const datasets = (data.get('lines') as List<any>)
        .map((line: Map<any, any>, index) => {
            const lineName: string = line.get('name')
            return {
                name: lineName,
                label: config.getIn(['lines', lineName, 'label']) || lineName,
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
    const linesInDataset = (data.get('lines') as List<any>)
        .map((line: Map<any, any>) => line.get('name') as string)
        .toArray()
    const linesInConfig: {
        [key: string]: {label: string; disabledLink: string}
    } = (config.get('lines', {}) as Map<any, any>).toJS()
    const disabledLegendLabels = Object.keys(linesInConfig)
        .filter((lineName) => linesInDataset.indexOf(lineName) === -1)
        .map((disabledLine) => ({
            name: disabledLine,
            label: `Enable ${linesInConfig[disabledLine].label} flow`,
            link: linesInConfig[disabledLine].disabledLink,
        }))

    const axeX = (data.getIn(['axes', 'x']) as List<any>)?.toArray() || []
    const [startAt, endAt] = [axeX[0] * 1000, axeX[axeX.length - 1] * 1000]

    const totalLabel = config.getIn(['totalOptions', 'label'])
    const totalTooltip = config.getIn(['totalOptions', 'tooltip'])
    const count = (array: number[]) => {
        return array.reduce((acc, cur) => acc + cur, 0)
    }
    const totalCount = datasets.reduce((acc, cur) => acc + count(cur.data), 0)
    const barTotals = datasets.map(({label, backgroundColor, data}) => {
        const currentCount = count(data)
        return {
            name: label,
            background: backgroundColor,
            count: currentCount,
            percent: (currentCount / totalCount) * 100,
        }
    })
    const percentData: number[][] = datasets
        .reduce(
            (acc: number[][], {data}) =>
                (data as number[]).map((value, index) => {
                    if (!acc[index]) {
                        acc[index] = []
                    }
                    return [...acc[index], value]
                }),
            []
        )
        .map((dataset) => {
            const total = count(dataset)

            return dataset.map((value) => (value / total) * 100)
        })
        .reduce(
            (acc: number[][], cur) =>
                cur.map((value: number, index: number) => {
                    if (!acc[index]) {
                        acc[index] = []
                    }

                    return [...acc[index], value]
                }),
            []
        )

    const datasetsWithPercents = datasets
        .map((dataset, index) => ({
            ...dataset,
            dataRaw: dataset.data,
            data: percentData[index],
        }))
        .map(({backgroundColor, name, ...dataset}) => ({
            ...dataset,
            backgroundColor:
                name === 'other_tickets'
                    ? `${backgroundColor as string}4D`
                    : backgroundColor,
        }))

    return (data.get('lines') as List<any>).isEmpty() ? (
        <div className="text-muted">There is no data for this period.</div>
    ) : (
        <>
            <Row>
                <Col className={`mb-4 ${css['legend-wrapper']}`}>
                    <Legend labels={legendLabels} />
                    {disabledLegendLabels.map(({name, label, link}) => (
                        <span
                            className={`${css['disabled-legend-label']} mr-4 mb-2`}
                            key={name}
                        >
                            <span
                                className={`${css['disabled-legend-label-circle']} mr-2`}
                            />
                            <Link to={link}>{label}</Link>
                        </span>
                    ))}
                </Col>
            </Row>
            <Row>
                <Col lg={9} md={8} sm={12}>
                    <div>
                        <Bar
                            type="bar"
                            height={chartMaxHeight}
                            data={{
                                labels: (
                                    data.getIn(['axes', 'x']) as List<any>
                                ).toJS(),
                                datasets: datasetsWithPercents,
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
                        <div className={css['bar-total-title-wrapper']}>
                            <h5>{totalLabel}</h5>
                            {totalTooltip && (
                                <span>
                                    <StatsHelpIcon id="normalized-bar-title-tooltip" />
                                    <Tooltip
                                        placement="top"
                                        target="normalized-bar-title-tooltip"
                                    >
                                        {totalTooltip}
                                    </Tooltip>
                                </span>
                            )}
                        </div>
                        <div className={css['bar-total-dates']}>
                            {startAt === endAt
                                ? moment(startAt).format('MMM Do')
                                : `${moment(startAt).format('MMM Do')} -
                                  ${moment(endAt).format('MMM Do')}`}
                        </div>
                        {barTotals.map(({name, background, count, percent}) => (
                            <div
                                key={name}
                                className={css['bar-total-data-wrapper']}
                            >
                                <div
                                    className={`${css.label} mr-4 mb-2`}
                                    key={name}
                                >
                                    <span
                                        className={`${css['circle']} mr-2`}
                                        style={{background}}
                                    />
                                    {name}
                                </div>
                                <div className={css['data']}>
                                    {count} (
                                    {isNaN(percent) ? 0 : percent.toFixed(0)}%)
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </>
    )
}

// Use memo to prevent redrawing on state change
export default React.memo(NormalizedBarStat, (prev, next) =>
    _isEqual(prev, next)
)
