import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _isFunction from 'lodash/isFunction'
import _truncate from 'lodash/truncate'
import {Table} from 'reactstrap'
import {Link, withRouter} from 'react-router'

import Tooltip from '../../../../../common/components/Tooltip'
import {DatetimeLabel} from '../../../../../common/utils/labels'
import {SATISFACTION_SURVEY_MAX_SCORE, SATISFACTION_SURVEY_MIN_SCORE,
    SATISFACTION_SURVEY_MAX_COMMENT_LENGTH} from '../../../../../../config/stats'
import {renderDifference, comparedPeriodString, formatCurrency} from '../../../utils'

import DistributionVariantStat from '../DistributionVariantStat'

import css from './TableStat.less'


@withRouter
export default class TableStat extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        data: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
        context: PropTypes.object
    }

    // render a value depending on its type (like a percent, a delta, etc.)
    _renderCell = (line, metric, type, index) => {
        const {meta, config, context} = this.props
        let callback = config.getIn(['callbacks', 'cell'])

        if (!_isFunction(callback)) {
            callback = ((line, val) => val)
        }

        switch (metric.get('type')) {
            case 'delta': {
                const previousStartDatetime = moment(meta.get('previous_start_datetime'))
                const previousEndDatetime = moment(meta.get('previous_end_datetime'))

                const tooltipDelta = comparedPeriodString(previousStartDatetime, previousEndDatetime)

                const id = `difference-${index}`

                return (
                    <span>
                        <span id={id}>
                            {renderDifference(callback(line, metric.get('value'), context), metric.get('value'))}
                        </span>
                        <Tooltip
                            placement="top"
                            target={id}
                        >
                            {tooltipDelta}
                        </Tooltip>
                    </span>
                )
            }
            case 'satisfaction-score': {
                return <DistributionVariantStat
                    minValue={SATISFACTION_SURVEY_MIN_SCORE}
                    maxValue={SATISFACTION_SURVEY_MAX_SCORE}
                    currentValue={metric.get('value')}
                    variant='star'
                />
            }
            case 'percent': {
                return callback(line, `${metric.get('value')}%`, context)
            }
            case 'date': {
                return <DatetimeLabel
                    dateTime={metric.get('value')}
                />
            }
            case 'currency': {
                return formatCurrency(metric.get('value'), metric.get('currency'))
            }
            case 'customer-link': {
                return <Link to={`/app/customer/${metric.get('customer_id')}`}>{metric.get('customer_name')}</Link>
            }
            case 'satisfaction-survey-link': {
                return <Link to={`/app/ticket/${metric.get('ticket_id')}#satisfactionSurvey`}>
                    {_truncate(metric.get('comment') || 'Go to ticket',
                        {length: SATISFACTION_SURVEY_MAX_COMMENT_LENGTH})}
                </Link>
            }
            default:
                return callback(line, metric.get('value'), context)
        }
    }

    // render the table
    render() {
        const {data} = this.props

        return (
            data.get('lines').isEmpty() ? (
                <div className="text-muted">
                    There is no data for this period.
                </div>
            ) :
                <Table
                    hover
                    className={css.table}
                >
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
                        {data.get('lines').map((line, lineIdx) =>
                            <tr key={lineIdx}>
                                {line.map((metric, metricIdx) => {
                                    const type = data.getIn(['axes', 'x', metricIdx, 'type'])
                                    return (
                                        <td
                                            key={metricIdx}
                                            className={css[`${type}`]}
                                        >
                                            <span className={css['cell-wrapper']}>
                                                {this._renderCell(line, metric, type, lineIdx)}
                                            </span>
                                        </td>
                                    )
                                })}
                            </tr>
                        ).toList()}
                    </tbody>
                </Table>
        )
    }
}
