import {Map, List} from 'immutable'
import React, {Component, ReactText} from 'react'
import moment from 'moment-timezone'
import _isFunction from 'lodash/isFunction'
import _trim from 'lodash/trim'
import _truncate from 'lodash/truncate'
import {Table} from 'reactstrap'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import classnames from 'classnames'

import expandDown from 'assets/img/infobar/expand-down.svg'
import expandUp from 'assets/img/infobar/expand-up-blue.svg'

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
import DistributionVariantStat from '../DistributionVariantStat'
import StatPercentageDiff from '../../StatPercentageDiff'
import StatsHelpIcon from '../../StatsHelpIcon'
import linkIcon from './link-icon.svg'

import ProductCell from './cells/ProductCell'
import css from './TableStat.less'
import TicketDetailsStat from './TicketDetailsStat'

type OwnProps = {
    data: Map<any, any>
    config: StatMap
    meta: Map<any, any>
    name?: string
    context: {
        tagColors: Map<any, any> | null
    }
}

type State = {
    expanded: boolean
}

export class TableStat extends Component<
    OwnProps & RouteComponentProps,
    State
> {
    state = {
        expanded: false,
    }

    _getTooltipId = (axis: Map<any, any>) =>
        `${(axis.get('name') as string)
            .replace(/%/g, 'percent')
            .replace(/ /g, '-')}-tooltip`

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
                const details = (
                    metric.get('details') as Map<any, any>
                )?.toJS() as Partial<Record<string, number>>
                return (
                    <div className="fit-cell">
                        <TicketDetailsStat
                            agentId={line.getIn(['0', 'value', 'id'])}
                            agentName={line.getIn(['0', 'value', 'name'])}
                            openTickets={
                                callback(
                                    callbackData,
                                    callbackContext
                                ) as number
                            }
                            channelsBreakdown={details}
                        />
                    </div>
                )
            }
            case StatValueType.OnlineTime: {
                const tooltipId = `${this._getTooltipId(axis)}-${lineIndex}`
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
                                label={(
                                    callback as StatConfigCallbacks<ReactText>['cell']
                                )(callbackData, callbackContext)}
                                percentage={metric.get('value')}
                                moreIsBetter={config.getIn([
                                    'tableOptions',
                                    'moreIsBetter',
                                ])}
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
                return (
                    <div className="fit-cell">
                        <DatetimeLabel dateTime={metric.get('value')} />
                    </div>
                )
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
                        className="fit-cell"
                    >
                        {metric.get('customer_name') || 'Go to customer'}
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
                        {_truncate(
                            _trim(metric.get('comment')) || 'Go to ticket',
                            {
                                length: SATISFACTION_SURVEY_MAX_COMMENT_LENGTH,
                            }
                        )}
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
            case StatValueType.Product: {
                return (
                    <ProductCell
                        name={metric.getIn(['value', 'name'])}
                        imageUrl={metric.getIn(['value', 'image_url'])}
                    />
                )
            }
            case StatValueType.TitleWithLink: {
                return (
                    <>
                        {metric.getIn(['value', 'title'])}{' '}
                        <a
                            href={metric.getIn(['value', 'url'])}
                            target={'_blank'}
                            rel="noreferrer"
                        >
                            <img src={linkIcon} alt="icon" />
                        </a>
                    </>
                )
            }
            default:
                return callback(callbackData, callbackContext)
        }
    }

    // Render the table
    render() {
        const {data, config} = this.props
        const showLines = config.getIn(['tableOptions', 'showLines'])
        const {expanded} = this.state

        const lines = (data.get('lines') as List<List<Map<any, any>>>)
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
                                    css[`${type}`],
                                    'link-full-td'
                                )}
                            >
                                <span
                                    className={classnames(
                                        css['cell-wrapper'],
                                        'cell-content'
                                    )}
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
            .toList()

        const displayExpandButton = showLines && lines.size > showLines

        return (data.get('lines') as List<any>).isEmpty() ? (
            <div className="text-muted">There is no data for this period.</div>
        ) : (
            <>
                <Table hover className={css.table}>
                    <thead>
                        <tr>
                            {(
                                data.getIn(['axes', 'x']) as List<Map<any, any>>
                            ).map((axe, index) => {
                                const axisId = this._getTooltipId(axe!)
                                return (
                                    <th
                                        key={index}
                                        className={
                                            css[`${axe!.get('type') as string}`]
                                        }
                                    >
                                        <span className={css['cell-wrapper']}>
                                            {(
                                                axe!.get('name') as string
                                            ).toUpperCase()}

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
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {showLines && !expanded
                            ? lines.slice(0, showLines)
                            : lines}
                    </tbody>
                </Table>
                {displayExpandButton && (
                    <button
                        onClick={() =>
                            this.setState({expanded: !this.state.expanded})
                        }
                        className={css.showLinesButton}
                    >
                        {expanded ? (
                            <div>
                                <img
                                    src={expandUp}
                                    alt="Contract"
                                    className="mr-3"
                                />
                                Show less
                            </div>
                        ) : (
                            <div>
                                <img
                                    src={expandDown}
                                    alt="Expand"
                                    className="mr-3"
                                />
                                Show More
                            </div>
                        )}
                    </button>
                )}
            </>
        )
    }
}

export default withRouter(TableStat)
