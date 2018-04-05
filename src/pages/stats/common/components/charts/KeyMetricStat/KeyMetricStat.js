// @flow
import React, {Component} from 'react'
import moment from 'moment'

import Tooltip from '../../../../../common/components/Tooltip'
import {comparedPeriodString, formatDuration, formatPercent} from '../../../utils'
import {renderDifference} from '../../../utils'
import css from './KeyMetricStat.less'
import statsCss from '../../../../style.less'

type Props = {
    data: Object,
    config: Object,
    meta: Object,
}

export default class KeyMetricStat extends Component<Props> {
    _renderValue = (config: Object, metric: Object) => {
        let value = metric.get('value')

        if (metric.get('type') === 'duration') {
            value = formatDuration(metric.get('value'), 2)
        } else if (metric.get('type') === 'percent') {
            value = formatPercent(metric.get('value'))
        }

        if (value || value === 0) {
            return (
                <div className={css.value}>
                    {value}
                </div>
            )
        }

        return <div className={css.value}>n/a</div>
    }

    render() {
        const {data, config, meta} = this.props
        const previousStartDatetime = moment(meta.get('previous_start_datetime'))
        const previousEndDatetime = moment(meta.get('previous_end_datetime'))
        const tooltipDelta = comparedPeriodString(previousStartDatetime, previousEndDatetime)

        return (
            <div className={css.metrics}>
                {data.map((metric, index) => {
                    const metricName = metric.get('name')
                    const metricConfig = config.getIn(['metrics', metricName])

                    if (!metricConfig) {
                        return null
                    }

                    const metricTooltipId = `title-${metricName}`
                    const valueTooltipId = `value-${index}`

                    return (
                        <div
                            className={css.metric}
                            key={metricName}
                        >
                            <div className={css.label}>
                                {metricConfig.get('label')}
                                <span>
                                    <i
                                        id={metricTooltipId}
                                        className={`${css['info-icon']} ${statsCss['help-icon']} material-icons ml-2`}
                                    >
                                        info_outline
                                    </i>
                                    <Tooltip
                                        placement="top"
                                        target={metricTooltipId}
                                    >
                                        {metricConfig.get('tooltip')}
                                    </Tooltip>
                                </span>
                            </div>
                            {this._renderValue(metricConfig, metric)}
                            <span id={valueTooltipId} className={css.diff}>
                                {renderDifference(metric.get('delta'), metric.get('delta'), metric.get('more_is_better'))}
                                <Tooltip
                                    placement="top"
                                    target={valueTooltipId}
                                >
                                    {tooltipDelta}
                                </Tooltip>
                            </span>
                        </div>
                    )
                })}
            </div>
        )
    }
}
