import moment from 'moment-timezone'
import {Map, List} from 'immutable'
import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Table} from 'reactstrap'

import {DEPRECATED_getBusinessHoursSettings} from '../../../../../../state/currentAccount/selectors'
import {getTimezone} from '../../../../../../state/currentUser/selectors'
import Legend, {Label} from '../../Legend/Legend'
import {RootState} from '../../../../../../state/types'

import css from './PerHourPerWeekTableStat.less'

type Props = {
    data: Map<any, any>
    config: Map<any, any>
    meta: Map<any, any>
    name?: string
    context?: {
        tagColors: Map<any, any> | null
    }
} & ConnectedProps<typeof connector>

type Limits = {
    n0: number
    n1: number
    n2: number
    n3: number
    n4: number
}

const colors = {
    rangeOneColor: '#F6F9FF',
    rangeTwoColor: '#D2E2FD',
    rangeThreeColor: '#9BC0FC',
    rangeFourColor: '#77A9FA',
    red: '#F4697D',
    white: '#FFFFFF',
}

const getDataIntervals = (lines: List<any>): Limits => {
    const allCounts = lines
        .map((row: List<any>) => {
            return row
                .slice(1)
                .filter((cell: Map<any, any>) => {
                    return cell.getIn(['type']) === 'number'
                })
                .map((cell: Map<any, any>) => {
                    return cell.getIn(['value']) as string | number
                })
        })
        .flatten()
        .toJS()
    const maxCount = Math.max(...allCounts)
    return {
        n0: Math.min(...allCounts),
        n1: Math.round(0.25 * maxCount),
        n2: Math.round(0.5 * maxCount),
        n3: Math.round(0.75 * maxCount),
        n4: maxCount,
    }
}

const getValueColor = (limits: Limits, value: number) => {
    if (limits.n4 >= 4) {
        if (value < limits.n1) {
            return colors.rangeOneColor
        } else if (value < limits.n2) {
            return colors.rangeTwoColor
        } else if (value < limits.n3) {
            return colors.rangeThreeColor
        }
        return colors.rangeFourColor
    }
    return colors.white
}

const getLegendLabels = (lines: List<any>): Label[] => {
    const limits = getDataIntervals(lines)
    const bHoursLegend = {
        name: 'Business Hours',
        background:
            'repeating-linear-gradient' +
            `(135deg, ${colors.white}, ${colors.white} 2px, ${colors.red} 2px, ${colors.red} 4px)`,
        shape: 'square' as const,
    }

    if (limits.n4 < 4) {
        return [bHoursLegend]
    }

    return [
        {
            aheadLabel: 'Least busy',
            name: 'Busiest',
            background:
                'linear-gradient(90deg,' +
                getValueColor(limits, limits.n0) +
                ' 25%, ' +
                getValueColor(limits, limits.n1) +
                ' 25%, ' +
                getValueColor(limits, limits.n1) +
                ' 50%, ' +
                getValueColor(limits, limits.n2) +
                ' 50%, ' +
                getValueColor(limits, limits.n2) +
                ' 75%, ' +
                getValueColor(limits, limits.n3) +
                ' 75%, ' +
                getValueColor(limits, limits.n3) +
                ' 100%)',
            shape: 'rectangle',
        },
        bHoursLegend,
    ]
}

const isInBusinessHour = (
    currentDayIsoCode: number,
    currentHour: number,
    userTimezone: string,
    bHoursSettings: Map<any, any>
) => {
    const _getDay = (isoDay: number) => {
        return `2019-06-0${2 + isoDay}`
    }

    const bHoursTimezone = bHoursSettings.getIn(['data', 'timezone'])
    const weekStart = moment.tz(_getDay(1) + 'T00:00', userTimezone)
    const weekEnd = moment.tz(_getDay(7) + 'T23:59', userTimezone)
    const testedDateTime = moment.tz(
        `${_getDay(currentDayIsoCode)}T${`00${currentHour}`.slice(-2)}:01`,
        userTimezone
    )

    for (const range of bHoursSettings.getIn(['data', 'business_hours'])) {
        for (const day of ((range as Map<any, any>).get('days') as string)
            .split(',')
            .map((day) => parseInt(day))) {
            const rangePeriodStart = moment.tz(
                `${_getDay(day)}T${
                    (range as Map<any, any>).get('from_time') as string
                }`,
                bHoursTimezone
            )
            const rangePeriodEnd = moment.tz(
                `${_getDay(day)}T${
                    (range as Map<any, any>).get('to_time') as string
                }`,
                bHoursTimezone
            )

            if (rangePeriodStart.isBefore(weekStart)) {
                const offsetStart = weekEnd
                    .clone()
                    .add(rangePeriodStart.diff(weekStart), 'ms')
                const offsetEnd = rangePeriodEnd.isBefore(weekStart)
                    ? weekEnd.clone().add(rangePeriodEnd.diff(weekStart), 'ms')
                    : weekEnd.clone()
                if (testedDateTime.isBetween(offsetStart, offsetEnd)) {
                    return true
                }
            } else if (rangePeriodEnd.isAfter(weekEnd)) {
                const offsetEnd = weekStart
                    .clone()
                    .add(rangePeriodEnd.diff(weekEnd), 'ms')
                const offsetStart = rangePeriodStart.isAfter(weekEnd)
                    ? weekStart
                          .clone()
                          .add(rangePeriodStart.diff(weekEnd), 'ms')
                    : weekStart.clone()
                if (testedDateTime.isBetween(offsetStart, offsetEnd)) {
                    return true
                }
            }

            if (testedDateTime.isBetween(rangePeriodStart, rangePeriodEnd)) {
                return true
            }
        }
    }
    return false
}

type TableCellsProps = {
    lines: List<any>
    userTimezone: string
    businessHoursSettings: Map<any, any>
}

export function TableCells(props: TableCellsProps) {
    const {lines, userTimezone, businessHoursSettings} = props
    const limits = getDataIntervals(lines)

    const metricRender = (
        metric: Map<any, any>,
        weekDayIdx: number,
        hourIdx: number
    ) => {
        return (
            <td
                key={weekDayIdx}
                style={{
                    backgroundColor:
                        metric.get('type') === 'number' &&
                        metric.get('value') !== null
                            ? getValueColor(limits, metric.get('value'))
                            : colors.white,
                }}
            >
                {weekDayIdx &&
                isInBusinessHour(
                    weekDayIdx,
                    hourIdx,
                    userTimezone,
                    businessHoursSettings
                ) ? (
                    <div className={css.redTransparentStripes}></div>
                ) : null}
                <span>
                    {metric.get('value') !== null ? metric.get('value') : 'n/a'}
                </span>
            </td>
        )
    }

    return (
        <>
            {lines
                .map((line: Map<any, any>, hour) => (
                    <tr key={hour}>
                        {line.map((metric, weekDay) => {
                            return metricRender(metric, weekDay, hour!)
                        })}
                    </tr>
                ))
                .toList()}
        </>
    )
}

export function PerHourPerWeekTableStatContainer(props: Props) {
    const {data, currentUserTimezone, businessHoursSettings} = props

    return (data.get('lines') as List<any>).isEmpty() ? (
        <div className="text-muted">There is no data for this period.</div>
    ) : (
        <div>
            <div className="mb-4">
                <Legend labels={getLegendLabels(data.get('lines'))} />
            </div>
            <Table hover className={css.hourlyTable}>
                <thead>
                    <tr>
                        {(data.getIn(['axes', 'x']) as List<any>).map(
                            (axe: Map<any, any>, index) => {
                                return (
                                    <th
                                        key={index}
                                        className={
                                            css[`${axe.get('type') as string}`]
                                        }
                                    >
                                        <span>
                                            {(
                                                axe.get('name') as string
                                            ).toUpperCase()}
                                        </span>
                                    </th>
                                )
                            }
                        )}
                    </tr>
                </thead>
                <tbody>
                    <TableCells
                        lines={data.get('lines')}
                        userTimezone={currentUserTimezone!}
                        businessHoursSettings={businessHoursSettings}
                    />
                </tbody>
            </Table>
        </div>
    )
}

const connector = connect((state: RootState) => {
    return {
        businessHoursSettings: DEPRECATED_getBusinessHoursSettings(state),
        currentUserTimezone: getTimezone(state),
    }
})

export default connector(PerHourPerWeekTableStatContainer)
