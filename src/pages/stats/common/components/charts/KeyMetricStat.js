import React, {PropTypes} from 'react'
import moment from 'moment'
import {comparedPeriodString, formatDuration, formatPercent} from '../../utils'
import {UncontrolledTooltip} from 'reactstrap'
import {renderDifference} from '../../utils'

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

    _renderValue = (config, metric, index, tooltipDelta) => {
        let value = metric.get('value')

        if (metric.get('type') === 'duration') {
            value = formatDuration(metric.get('value'), 2)
        } else if (metric.get('type') === 'percent') {
            value = formatPercent(metric.get('value'))
        }

        if (value || value === 0) {
            return (
                <div className="value">
                    {value}
                    {
                        this._renderTooltip(
                            `value-${index}`,
                            tooltipDelta,
                            renderDifference(metric.get('delta'), metric.get('delta'), metric.get('more_is_better')
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

        return (
            <div className="statistics">
                {data.map((metric, index) => {
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
                            {this._renderValue(metricConfig, metric, index, tooltipDelta)}
                        </div>
                    )
                })}
            </div>
        )
    }
}
