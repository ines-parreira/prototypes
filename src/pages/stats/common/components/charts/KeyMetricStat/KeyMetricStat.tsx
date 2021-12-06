import React, {Component, ReactNode} from 'react'
import moment from 'moment'
import classnames from 'classnames'
import {fromJS, Map, List} from 'immutable'
import _isObject from 'lodash/isObject'

import Tooltip from '../../../../../common/components/Tooltip'
import {
    comparedPeriodString,
    formatCurrency,
    formatDuration,
    formatPercent,
} from '../../../utils'
import Loader from '../../../../../common/components/Loader/Loader'
import StatsHelpIcon from '../../StatsHelpIcon'
import StatPercentageDiff from '../../StatPercentageDiff'
import {StatConfig} from '../../../../../../config/stats'

import css from './KeyMetricStat.less'
import DonutKeyMetricStat from './DonutKeyMetricStat'
import DistributionKeyMetricStat from './DistributionKeyMetricStat'

type Props = {
    data: List<any>
    config: Map<any, any>
    meta: Map<any, any>
    loading: boolean | Map<any, any>
}

export default class KeyMetricStat extends Component<Props> {
    _defaultWrapper = (
        formattedValue: string | number,
        metric: Map<any, any>,
        valueTooltipId: string,
        tooltipDelta: string | null
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
        metric: Map<any, any>,
        tooltipDelta: string | null
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
        config: Map<any, any>,
        metric: Map<any, any> | null,
        valueTooltipId: string,
        tooltipDelta: string | null
    ) => {
        if (!metric) {
            return '-'
        }

        if (config.get('formatData')) {
            return this._defaultWrapper(
                (config.get('formatData') as StatConfig['formatData'])!(
                    metric
                ) as any,
                metric,
                valueTooltipId,
                tooltipDelta
            )
        }

        const value = metric.get('value') as string | Map<any, any>

        if (_isObject(value)) {
            const formattedValue = fromJS(
                value.reduce(
                    (acc, value, key) => ({
                        ...acc,
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
                formattedValue={formattedValue as string}
                label={`${metric.get('delta') as number}%`}
                differenceComponent={this._renderDifference(
                    valueTooltipId,
                    metric,
                    tooltipDelta
                )}
            />
        ) : (
            this._defaultWrapper(
                formattedValue,
                metric,
                valueTooltipId,
                tooltipDelta
            )
        )
    }

    _formatValue = (value: any, metric: Map<any, any>) => {
        switch (metric.get('type')) {
            case 'duration':
                return formatDuration(value, 2)
            case 'percent':
                return formatPercent(value)
            case 'currency':
                return formatCurrency(value, metric.get('currency'))
            default:
                return value as string
        }
    }

    render() {
        const {data, config, loading} = this.props

        const labelStyle = config.get('labelStyle') as string

        return (
            <div className={css.metrics}>
                {(config.get('metrics') as List<any>).map(
                    (metricConfig: Map<any, any>, index) => {
                        const metricName = (metricConfig.get(
                            'api_resource_name'
                        ) || metricConfig.get('name')) as string
                        const Component = metricConfig.get('component')
                        if (Component) {
                            return <Component />
                        }

                        const metricTooltipId = `title-${metricName}-${index!}`
                        const valueTooltipId = `value-${metricName}-${index!}`
                        let previousStartDatetime = null
                        let previousEndDatetime = null
                        let tooltipDelta = null

                        const isFetchingMetric =
                            typeof loading === 'boolean'
                                ? loading
                                : loading.get(
                                      metricConfig.get('api_resource_name')
                                  )
                        const metric = data
                            ? data.find((metric: Map<any, any>, j) =>
                                  metric.get('name')
                                      ? metric.get('name') ===
                                        metricConfig.get('name')
                                      : j === index
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
                            <div
                                className={css.metric}
                                key={`${metricName}-${index!}`}
                            >
                                <div
                                    className={classnames(
                                        css.label,
                                        labelStyle ? css[labelStyle] : ''
                                    )}
                                >
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
                                            {typeof metricConfig.get(
                                                'tooltip'
                                            ) === 'string'
                                                ? metricConfig.get('tooltip')
                                                : (
                                                      metricConfig.get(
                                                          'tooltip'
                                                      ) as (
                                                          data: Map<any, any>
                                                      ) => ReactNode
                                                  )(metric)}
                                        </Tooltip>
                                    </span>
                                </div>
                                <div
                                    className={classnames(
                                        'mt-3',
                                        css.statsDisplay
                                    )}
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
                    }
                )}
            </div>
        )
    }
}
