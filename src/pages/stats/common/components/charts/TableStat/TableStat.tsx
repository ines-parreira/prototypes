import {Map, List} from 'immutable'
import React, {Component, ReactText} from 'react'
import moment from 'moment-timezone'
import _isFunction from 'lodash/isFunction'
import _truncate from 'lodash/truncate'
import {Table} from 'reactstrap'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import classnames from 'classnames'

import Tooltip from '../../../../../common/components/Tooltip'
import {DatetimeLabel} from '../../../../../common/utils/labels'
import {
    SATISFACTION_SURVEY_MAX_COMMENT_LENGTH,
    SATISFACTION_SURVEY_MAX_SCORE,
    SATISFACTION_SURVEY_MIN_SCORE,
    StatConfigCallbacks,
    StatMap,
    StatValueType,
    TICKET_MAX_SUBJECT_LENGTH,
} from '../../../../../../config/stats'
import {
    comparedPeriodString,
    formatCurrency,
    formatDuration,
} from '../../../utils'
import DistributionVariantStat from '../DistributionVariantStat.js'
import StatPercentageDiff from '../../StatPercentageDiff'
import StatsHelpIcon from '../../StatsHelpIcon'
import SourceIcon from '../../../../../common/components/SourceIcon'
import {TicketMessageSourceType} from '../../../../../../business/types/ticket'

import css from './TableStat.less'

type OwnProps = {
    data: Map<any, any>
    config: StatMap
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
        lineIndex: number,
        metricIndex: number
    ) => {
        const {meta, config, context, data} = this.props
        const axis = data.getIn(['axes', 'x', metricIndex]) as Map<any, any>
        const type = axis.get('type')
        const callbackData = {
            line,
            value: metric.get('value'),
            lineIndex,
            metricIndex,
            axis: axis.toJS(),
        }
        const callbackContext = {
            tagColors: context.tagColors,
        }

        let callback = config.getIn([
            'callbacks',
            'cell',
        ]) as StatConfigCallbacks['cell']
        if (!_isFunction(callback)) {
            callback = ({value}) => value
        }

        switch (type) {
            case StatValueType.TicketDetails: {
                const details = (metric.get('details') as Map<
                    any,
                    any
                >)?.toJS() as Record<TicketMessageSourceType, string>
                return metric.get('value') ? (
                    <div className={css.ticketDetailsWrapper}>
                        <div>{callback(callbackData, callbackContext)}</div>
                        <div className={css.ticketDetailsSeparator} />
                        <div className={css.ticketDetailsList}>
                            {(Object.keys(
                                details
                            ) as TicketMessageSourceType[]).map((key) => {
                                return details[key] ? (
                                    <div key={key} className={css.ticketDetail}>
                                        <SourceIcon
                                            type={key}
                                            className={css.ticketDetailIcon}
                                        />
                                        {details[key]}
                                    </div>
                                ) : null
                            })}
                        </div>
                    </div>
                ) : (
                    <div className={css.ticketDetailsEmpty}>
                        No open tickets assigned to this agent
                    </div>
                )
            }
            case StatValueType.OnlineTime: {
                const tooltipId = `${(axis.get('name') as string).replace(
                    ' ',
                    '-'
                )}-${lineIndex}-tooltip`
                const value = Math.floor(metric.get('value', 2) / 60) * 60

                return (
                    <div>
                        <div
                            className={classnames(css.statusDot, {
                                [css.isOnline]: metric.getIn([
                                    'extra',
                                    'isOnline',
                                ]),
                            })}
                            id={tooltipId}
                        />
                        {(metric.getIn(['extra', 'firstSession']) ||
                            metric.getIn(['extra', 'lastSession'])) && (
                            <Tooltip target={tooltipId}>
                                {metric.getIn(['extra', 'timezone']) && (
                                    <>
                                        <b>Timezone </b>
                                        {metric.getIn(['extra', 'timezone'])}
                                        <br />
                                    </>
                                )}
                                {metric.getIn(['extra', 'lastSession']) ? (
                                    <>
                                        Session ended at{' '}
                                        {moment(
                                            metric.getIn([
                                                'extra',
                                                'lastSession',
                                            ])
                                        ).format('hh:mm a')}
                                    </>
                                ) : metric.getIn(['extra', 'firstSession']) ? (
                                    <>
                                        Session started at{' '}
                                        {moment(
                                            metric.getIn([
                                                'extra',
                                                'firstSession',
                                            ])
                                        ).format('hh:mm a')}
                                    </>
                                ) : null}
                            </Tooltip>
                        )}
                        <span
                            className={!value ? css.emptyDuration : undefined}
                        >
                            {callback(
                                {
                                    ...callbackData,
                                    value: value
                                        ? formatDuration(value)
                                        : 'No information',
                                },
                                context
                            )}
                        </span>
                    </div>
                )
            }
            case StatValueType.User: {
                return (
                    <div>
                        <div className={css.userName}>
                            {metric.getIn(['value', 'name'])
                                ? callback(
                                      {
                                          ...callbackData,
                                          value: metric.getIn([
                                              'value',
                                              'name',
                                          ]),
                                      },
                                      context
                                  )
                                : callback(
                                      {...callbackData, value: 'Unassigned'},
                                      context
                                  )}
                        </div>
                    </div>
                )
            }
            case StatValueType.Delta: {
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

                const id = `difference-${lineIndex}`

                return (
                    <span>
                        <span id={id}>
                            <StatPercentageDiff
                                label={(callback as StatConfigCallbacks<
                                    ReactText
                                >['cell'])(callbackData, callbackContext)}
                                percentage={metric.get('value')}
                            />
                        </span>
                        <Tooltip placement="top" target={id}>
                            {tooltipDelta}
                        </Tooltip>
                    </span>
                )
            }
            case StatValueType.SatisfactionScore: {
                return (
                    <DistributionVariantStat
                        minValue={SATISFACTION_SURVEY_MIN_SCORE}
                        maxValue={SATISFACTION_SURVEY_MAX_SCORE}
                        currentValue={metric.get('value')}
                        variant="star"
                    />
                )
            }
            case StatValueType.Percent: {
                return callback(
                    {
                        ...callbackData,
                        value: `${metric.get('value') as number}%`,
                    },
                    callbackContext
                )
            }
            case StatValueType.Date: {
                return <DatetimeLabel dateTime={metric.get('value')} />
            }
            case StatValueType.Currency: {
                return formatCurrency(
                    metric.get('value'),
                    metric.get('currency')
                ) as string
            }
            case StatValueType.CustomerLink: {
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
            case StatValueType.SatisfactionSurveyLink: {
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
            case StatValueType.TicketLink: {
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
                return callback(callbackData, callbackContext)
        }
    }

    // Render the table
    render() {
        const {data, config} = this.props

        return (data.get('lines') as List<any>).isEmpty() ? (
            <div className="text-muted">There is no data for this period.</div>
        ) : (
            <Table hover className={css.table}>
                <thead>
                    <tr>
                        {(data.getIn(['axes', 'x']) as List<Map<any, any>>).map(
                            (axe, index) => {
                                const axisId = `${(axe!.get(
                                    'name'
                                ) as string).replace(' ', '-')}-tooltip`
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

                                            {config.getIn([
                                                'axisHelpers',
                                                axe!.get('name'),
                                            ]) && (
                                                <span
                                                    className={
                                                        css.axisHelperIcon
                                                    }
                                                >
                                                    <StatsHelpIcon
                                                        id={axisId}
                                                    />
                                                    <Tooltip
                                                        placement="top"
                                                        target={axisId}
                                                    >
                                                        {config.getIn([
                                                            'axisHelpers',
                                                            axe!.get('name'),
                                                        ])}
                                                    </Tooltip>
                                                </span>
                                            )}
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
                                            className={classnames(
                                                css.lineCell,
                                                css[`${type}`]
                                            )}
                                        >
                                            <span
                                                className={css['cell-wrapper']}
                                            >
                                                {this._renderCell(
                                                    line!,
                                                    metric!,
                                                    lineIdx!,
                                                    metricIdx!
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
