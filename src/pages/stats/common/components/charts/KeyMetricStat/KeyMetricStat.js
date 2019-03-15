// @flow
import React, {Component} from 'react'
import moment from 'moment'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _isObject from 'lodash/isObject'

import Tooltip from '../../../../../common/components/Tooltip'
import {renderDifference, comparedPeriodString, formatDuration, formatPercent, formatCurrency} from '../../../utils'

import statsCss from '../../../../style.less'

import DonutKeyMetricStat from './DonutKeyMetricStat'
import DistributionKeyMetricStat from './DistributionKeyMetricStat'

import css from './KeyMetricStat.less'


type Props = {
    data: Object,
    config: Object,
    meta: Object,
}

export default class KeyMetricStat extends Component<Props> {
    _defaultWrapper = (formattedValue: string, metric: Object, valueTooltipId: string,
        tooltipDelta: string) => {
        return <div>
            {
                (formattedValue || formattedValue === 0) ?
                    <div className={css.value}>{formattedValue}</div> : <div className={css.value}>n/a</div>
            }
            {this._renderDifference(valueTooltipId, metric, tooltipDelta)}
        </div>
    }

    _renderDifference = (valueTooltipId: string, metric: Object, tooltipDelta: string) => {
        return (
            <span
                id={valueTooltipId}
                className={css.diff}
            >
                {renderDifference(metric.get('delta'), metric.get('delta'), metric.get('more_is_better'))}
                <Tooltip
                    placement="top"
                    target={valueTooltipId}
                >
                    {tooltipDelta}
                </Tooltip>
            </span>
        )
    }

    _renderValue = (config: Object, metric: Object, valueTooltipId: string, tooltipDelta: string) => {
        const value = metric.get('value')

        if (_isObject(value)) {
            const formattedValue = fromJS(value.reduce((acc, value, key) => ({
                ...acc,
                [key]: this._formatValue(value, metric)
            }), {}))

            return <DistributionKeyMetricStat
                config={config}
                formattedValue={formattedValue}
            />
        }

        const formattedValue = this._formatValue(value, metric)

        return config.get('type') === 'donut' ? <DonutKeyMetricStat
            value={parseFloat(value)}
            maxValue={parseFloat(config.get('maxValue'))}
            fill={config.get('fill')}
            formattedValue={formattedValue}
            label={`${metric.get('delta')}%`}
            differenceComponent={this._renderDifference(valueTooltipId, metric, tooltipDelta)}
        /> : this._defaultWrapper(formattedValue, metric, valueTooltipId, tooltipDelta)
    }

    _formatValue = (value: string, metric: Map<string, *>) => {
        switch (metric.get('type')) {
            case 'duration':
                return formatDuration(value, 2)
            case 'percent':
                return formatPercent(value)
            case 'currency':
                return formatCurrency(value, metric.get('currency'))
            default:
                return value
        }
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
                            <div className={classnames('mt-3', css.statsDisplay)}>
                                {this._renderValue(metricConfig, metric, valueTooltipId, tooltipDelta)}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}
