// @flow
import React, {Component} from 'react'
import moment from 'moment'
import classnames from 'classnames'
import {fromJS, type Map} from 'immutable'
import _isObject from 'lodash/isObject'

import Tooltip from '../../../../../common/components/Tooltip.tsx'
import {
    comparedPeriodString,
    formatCurrency,
    formatDuration,
    formatPercent,
} from '../../../utils'
import Loader from '../../../../../common/components/Loader/Loader.tsx'
import StatsHelpIcon from '../../StatsHelpIcon.tsx'
import StatPercentageDiff from '../../StatPercentageDiff.tsx'

import css from './KeyMetricStat.less'
import DonutKeyMetricStat from './DonutKeyMetricStat'
import DistributionKeyMetricStat from './DistributionKeyMetricStat'

type Props = {
    data: Object,
    config: Object,
    meta: Object,
    loading: boolean | Map<any, any>,
}

export default class KeyMetricStat extends Component<Props> {
    _defaultWrapper = (
        formattedValue: number,
        metric: Object,
        valueTooltipId: string,
        tooltipDelta: string
    ) => {
        return (
            <div>
                {formattedValue || formattedValue === 0 ? (
                    <div className={css.value}>{formattedValue}</div>
                ) : (
                    <div className={css.value}>n/a</div>
                )}
                {this._renderDifference(valueTooltipId, metric, tooltipDelta)}
            </div>
        )
    }

    _renderDifference = (
        valueTooltipId: string,
        metric: Object,
        tooltipDelta: string
    ) => {
        return (
            <span id={valueTooltipId} className={css.diff}>
                <StatPercentageDiff
                    label={metric.get('delta')}
                    percentage={metric.get('delta')}
                    moreIsBetter={metric.get('more_is_better')}
                />
                <Tooltip placement="top" target={valueTooltipId}>
                    {tooltipDelta}
                </Tooltip>
            </span>
        )
    }

    _renderValue = (
        config: Object,
        metric: ?Object,
        valueTooltipId: string,
        tooltipDelta: ?string
    ) => {
        if (!metric) {
            return '-'
        }

        const value = metric.get('value')

        if (_isObject(value)) {
            const formattedValue = fromJS(
                value.reduce(
                    (acc, value, key) => ({
                        ...acc,
                        // $FlowFixMe
                        [key]: this._formatValue(value, metric),
                    }),
                    {}
                )
            )

            return (
                <DistributionKeyMetricStat
                    config={config}
                    formattedValue={formattedValue}
                />
            )
        }

        const formattedValue = this._formatValue(value, metric)

        return config.get('type') === 'donut' ? (
            <DonutKeyMetricStat
                value={parseFloat(value)}
                maxValue={parseFloat(config.get('maxValue'))}
                fill={config.get('fill')}
                formattedValue={formattedValue}
                label={`${metric.get('delta')}%`}
                differenceComponent={this._renderDifference(
                    valueTooltipId,
                    metric,
                    // $FlowFixMe
                    tooltipDelta
                )}
            />
        ) : (
            this._defaultWrapper(
                // $FlowFixMe
                formattedValue,
                metric,
                valueTooltipId,
                // $FlowFixMe
                tooltipDelta
            )
        )
    }

    _formatValue = (value: string, metric: Object) => {
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
        const {data, config, loading} = this.props

        return (
            <div className={css.metrics}>
                {config.get('metrics').map((metricConfig) => {
                    const metricName =
                        metricConfig.get('api_resource_name') ||
                        metricConfig.get('name')
                    const metricTooltipId = `title-${metricName}`
                    const valueTooltipId = `value-${metricName}`
                    let previousStartDatetime = null
                    let previousEndDatetime = null
                    let tooltipDelta = null

                    const isFetchingMetric =
                        typeof loading === 'boolean'
                            ? loading
                            : loading.get(metricConfig.get('api_resource_name'))
                    const metric = data
                        ? data.find(
                              (metric) =>
                                  metric.get('name') ===
                                  metricConfig.get('name')
                          )
                        : null
                    const metricMeta = this.props.meta

                    if (metricMeta) {
                        previousStartDatetime = moment(
                            metricMeta.get('previous_start_datetime')
                        )
                        previousEndDatetime = moment(
                            metricMeta.get('previous_end_datetime')
                        )
                        tooltipDelta = comparedPeriodString(
                            previousStartDatetime,
                            previousEndDatetime
                        )
                    }

                    return (
                        <div className={css.metric} key={metricName}>
                            <div className={css.label}>
                                {metricConfig.get('label')}
                                <span>
                                    <StatsHelpIcon
                                        id={metricTooltipId}
                                        className={css['info-icon']}
                                    />
                                    <Tooltip
                                        placement="top"
                                        target={metricTooltipId}
                                    >
                                        {metricConfig.get('tooltip')}
                                    </Tooltip>
                                </span>
                            </div>
                            <div
                                className={classnames('mt-3', css.statsDisplay)}
                            >
                                {isFetchingMetric ? (
                                    <Loader minHeight="90px" size="20px" />
                                ) : (
                                    this._renderValue(
                                        metricConfig,
                                        metric,
                                        valueTooltipId,
                                        tooltipDelta
                                    )
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}
