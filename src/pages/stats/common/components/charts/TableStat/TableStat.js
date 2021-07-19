// @flow
import type {Map} from 'immutable'
import React from 'react'
import moment from 'moment'
import _isFunction from 'lodash/isFunction'
import _truncate from 'lodash/truncate'
import {Table} from 'reactstrap'
import {Link, withRouter} from 'react-router-dom'

import Tooltip from '../../../../../common/components/Tooltip.tsx'
import {DatetimeLabel} from '../../../../../common/utils/labels.tsx'
import {
    SATISFACTION_SURVEY_MAX_COMMENT_LENGTH,
    SATISFACTION_SURVEY_MAX_SCORE,
    SATISFACTION_SURVEY_MIN_SCORE,
    TICKET_MAX_SUBJECT_LENGTH,
} from '../../../../../../config/stats.tsx'
import {comparedPeriodString, formatCurrency} from '../../../utils'
import DistributionVariantStat from '../DistributionVariantStat'
import StatPercentageDiff from '../../StatPercentageDiff.tsx'

import css from './TableStat.less'

type Props = {
    data: Map<*, *>,
    config: Map<*, *>,
    meta: Map<*, *>,
    name?: string,
    context?: {
        tagColors: Map<*, *>,
    },
}

export class TableStat extends React.Component<Props> {
    // Render a table cell depending on its value type (percent, date, delta, etc.)
    _renderCell = (
        line: Map<*, *>,
        metric: Map<*, *>,
        type: string,
        index: number
    ) => {
        const {meta, config, context} = this.props

        let callback = config.getIn(['callbacks', 'cell'])
        if (!_isFunction(callback)) {
            callback = ((line, val) => val: any)
        }

        switch (type) {
            case 'delta': {
                const previousStartDatetime = moment(
                    meta.get('previous_start_datetime')
                )
                const previousEndDatetime = moment(
                    meta.get('previous_end_datetime')
                )

                const tooltipDelta = comparedPeriodString(
                    previousStartDatetime,
                    previousEndDatetime
                )

                const id = `difference-${index}`

                return (
                    <span>
                        <span id={id}>
                            <StatPercentageDiff
                                label={callback(
                                    line,
                                    metric.get('value'),
                                    context
                                )}
                                percentage={metric.get('value')}
                            />
                        </span>
                        <Tooltip placement="top" target={id}>
                            {tooltipDelta}
                        </Tooltip>
                    </span>
                )
            }
            case 'satisfaction-score': {
                return (
                    <DistributionVariantStat
                        minValue={SATISFACTION_SURVEY_MIN_SCORE}
                        maxValue={SATISFACTION_SURVEY_MAX_SCORE}
                        currentValue={metric.get('value')}
                        variant="star"
                    />
                )
            }
            case 'percent': {
                return callback(line, `${metric.get('value')}%`, context)
            }
            case 'date': {
                return <DatetimeLabel dateTime={metric.get('value')} />
            }
            case 'currency': {
                return formatCurrency(
                    metric.get('value'),
                    metric.get('currency')
                )
            }
            case 'customer-link': {
                return (
                    <Link to={`/app/customer/${metric.get('customer_id')}`}>
                        {metric.get('customer_name')}
                    </Link>
                )
            }
            case 'satisfaction-survey-link': {
                return (
                    <Link
                        to={`/app/ticket/${metric.get(
                            'ticket_id'
                        )}#satisfactionSurvey`}
                    >
                        {_truncate(metric.get('comment') || 'Go to ticket', {
                            length: SATISFACTION_SURVEY_MAX_COMMENT_LENGTH,
                        })}
                    </Link>
                )
            }
            case 'ticket-link': {
                return (
                    <Link to={`/app/ticket/${metric.get('ticket_id')}`}>
                        {_truncate(
                            metric.get('subject') ||
                                `Ticket #${metric.get('ticket_id')}`,
                            {length: TICKET_MAX_SUBJECT_LENGTH}
                        )}
                    </Link>
                )
            }
            default:
                return callback(line, metric.get('value'), context)
        }
    }

    // Render the table
    render() {
        const {data} = this.props

        return data.get('lines').isEmpty() ? (
            <div className="text-muted">There is no data for this period.</div>
        ) : (
            <Table hover className={css.table}>
                <thead>
                    <tr>
                        {data.getIn(['axes', 'x']).map((axe, index) => {
                            return (
                                <th
                                    key={index}
                                    className={css[`${axe.get('type')}`]}
                                >
                                    <span className={css['cell-wrapper']}>
                                        {axe.get('name').toUpperCase()}
                                    </span>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data
                        .get('lines')
                        .map((line, lineIdx) => (
                            <tr key={lineIdx}>
                                {line.map((metric, metricIdx) => {
                                    const type = data.getIn([
                                        'axes',
                                        'x',
                                        metricIdx,
                                        'type',
                                    ])
                                    return (
                                        <td
                                            key={metricIdx}
                                            className={css[`${type}`]}
                                        >
                                            <span
                                                className={css['cell-wrapper']}
                                            >
                                                {this._renderCell(
                                                    line,
                                                    metric,
                                                    type,
                                                    lineIdx
                                                )}
                                            </span>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))
                        .toList()}
                </tbody>
            </Table>
        )
    }
}

export default withRouter(TableStat)
