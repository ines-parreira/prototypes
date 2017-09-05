import React, {PropTypes} from 'react'
import moment from 'moment'
import {comparedPeriodString, formatDuration, formatPercent} from '../../utils'
import {UncontrolledTooltip} from 'reactstrap'
import {renderDifference} from '../../utils'
import {fromJS} from 'immutable'

export default class KeyMetricStat extends React.Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
    }

    // render helper tooltip displaying description of each statistic
    _renderTooltip = (id, text, content) => {
        return (
            <span>
                <span id={id}>
                    {content}
                </span>
                <UncontrolledTooltip
                    placement="top"
                    target={id}
                    delay={0}
                >
                    {text}
                </UncontrolledTooltip>
            </span>
        )
    }

    _renderValue = (config, value, index, tooltipDelta) => {
        const {data} = this.props

        if (config.get('type') === 'duration') {
            value = formatDuration(value)
        } else if (config.get('type') === 'percent') {
            value = formatPercent(value)
        }

        if (value || value === 0) {
            return (
                <div className="value">
                    {value}
                    {
                        this._renderTooltip(
                            `value-${index}`,
                            tooltipDelta,
                            renderDifference(
                                data.getIn(['difference_period', index, 'data']),
                                config.get('moreIsBetter')
                            )
                        )
                    }
                </div>
            )
        }

        return <div className="value">n/a</div>
    }

    render() {
        const {data, config, meta} = this.props
        const previousStartDatetime = moment(meta.get('previous_start_datetime'))
        const previousEndDatetime = moment(meta.get('previous_end_datetime'))
        const tooltipDelta = comparedPeriodString(previousStartDatetime, previousEndDatetime)
        const currentPeriod = data.get('current_period') || fromJS({})

        return (
            <div className="statistics">
                {currentPeriod.map((metric, index) => {
                    const metricName = metric.get('name')
                    const metricConfig = config.getIn(['metrics', metricName])

                    if (!metricConfig) {
                        return null
                    }

                    return (
                        <div
                            className="statistic"
                            key={metricName}
                        >
                            <div className="label">
                                {metricConfig.get('label')}
                                {this._renderTooltip(
                                    `title-${metricName}`,
                                    metricConfig.get('tooltip'),
                                    <i className="fa fa-fw fa-question-circle ml-1"/>
                                )}
                            </div>
                            {this._renderValue(metricConfig, metric.get('data'), index, tooltipDelta)}
                        </div>
                    )
                })}
            </div>
        )
    }
}
