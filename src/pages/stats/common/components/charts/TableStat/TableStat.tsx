import {Map, List} from 'immutable'
import React, {Component, ReactNode} from 'react'
import moment from 'moment'
import _isFunction from 'lodash/isFunction'
import _truncate from 'lodash/truncate'
import {Table} from 'reactstrap'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'

import Tooltip from '../../../../../common/components/Tooltip'
import {DatetimeLabel} from '../../../../../common/utils/labels'
import {
    SATISFACTION_SURVEY_MAX_COMMENT_LENGTH,
    SATISFACTION_SURVEY_MAX_SCORE,
    SATISFACTION_SURVEY_MIN_SCORE,
    TICKET_MAX_SUBJECT_LENGTH,
} from '../../../../../../config/stats'
import {comparedPeriodString, formatCurrency} from '../../../utils.js'
import DistributionVariantStat from '../DistributionVariantStat.js'
import StatPercentageDiff from '../../StatPercentageDiff'

import css from './TableStat.less'

type OwnProps = {
    data: Map<any, any>
    config: Map<any, any>
    meta: Map<any, any>
    name?: string
    context: {
        tagColors: Map<any, any> | null
    }
}

export class TableStat extends Component<OwnProps & RouteComponentProps> {
    // Render a table cell depending on its value type (percent, date, delta, etc.)
    _renderCell = (
        line: List<any>,
        metric: Map<any, any>,
        type: string,
        index: number
    ) => {
        const {meta, config, context} = this.props

        let callback = config.getIn(['callbacks', 'cell']) as (
            line: List<any>,
            val: string | number,
            context?: OwnProps['context']
        ) => string | number | ReactNode
        if (!_isFunction(callback)) {
            callback = (line: List<any>, val: string | number) => val
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
                                label={
                                    callback(
                                        line,
                                        metric.get('value'),
                                        context
                                    ) as string | number
                                }
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
                return callback(
                    line,
                    `${metric.get('value') as string}%`,
                    context
                )
            }
            case 'date': {
                return <DatetimeLabel dateTime={metric.get('value')} />
            }
            case 'currency': {
                return formatCurrency(
                    metric.get('value'),
                    metric.get('currency')
                ) as string
            }
            case 'customer-link': {
                return (
                    <Link
                        to={`/app/customer/${
                            metric.get('customer_id') as string
                        }`}
                    >
                        {metric.get('customer_name')}
                    </Link>
                )
            }
            case 'satisfaction-survey-link': {
                return (
                    <Link
                        to={`/app/ticket/${
                            metric.get('ticket_id') as string
                        }#satisfactionSurvey`}
                    >
                        {_truncate(metric.get('comment') || 'Go to ticket', {
                            length: SATISFACTION_SURVEY_MAX_COMMENT_LENGTH,
                        })}
                    </Link>
                )
            }
            case 'ticket-link': {
                return (
                    <Link
                        to={`/app/ticket/${metric.get('ticket_id') as string}`}
                    >
                        {_truncate(
                            metric.get('subject') ||
                                `Ticket #${metric.get('ticket_id') as string}`,
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

        return (data.get('lines') as List<any>).isEmpty() ? (
            <div className="text-muted">There is no data for this period.</div>
        ) : (
            <Table hover className={css.table}>
                <thead>
                    <tr>
                        {(data.getIn(['axes', 'x']) as List<Map<any, any>>).map(
                            (axe, index) => {
                                return (
                                    <th
                                        key={index}
                                        className={
                                            css[`${axe!.get('type') as string}`]
                                        }
                                    >
                                        <span className={css['cell-wrapper']}>
                                            {(axe!.get(
                                                'name'
                                            ) as string).toUpperCase()}
                                        </span>
                                    </th>
                                )
                            }
                        )}
                    </tr>
                </thead>
                <tbody>
                    {(data.get('lines') as List<List<Map<any, any>>>)
                        .map((line, lineIdx) => (
                            <tr key={lineIdx}>
                                {line!.map((metric, metricIdx) => {
                                    const type = data.getIn([
                                        'axes',
                                        'x',
                                        metricIdx,
                                        'type',
                                    ]) as string
                                    return (
                                        <td
                                            key={metricIdx}
                                            className={css[`${type}`]}
                                        >
                                            <span
                                                className={css['cell-wrapper']}
                                            >
                                                {this._renderCell(
                                                    line!,
                                                    metric!,
                                                    type,
                                                    lineIdx!
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
