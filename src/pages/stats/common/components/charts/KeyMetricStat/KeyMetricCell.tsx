import React, { ReactNode } from 'react'

import classnames from 'classnames'
import { fromJS, List, Map } from 'immutable'
import _isObject from 'lodash/isObject'
import moment from 'moment'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { StatConfigMetric } from 'config/stats'
import { StatType } from 'models/stat/types'
import Loader from 'pages/common/components/Loader/Loader'
import StatDifference from 'pages/stats/common/components/StatDifference'
import {
    formatComparedPeriodString,
    formatCurrency,
    formatDuration,
    formatNumber,
    formatPercent,
} from 'pages/stats/common/utils'
import { NOT_AVAILABLE_LABEL } from 'services/reporting/constants'

import DistributionKeyMetricStat from './DistributionKeyMetricStat'
import DonutKeyMetricStat from './DonutKeyMetricStat'
import KeyMetricCellWrapper from './KeyMetricCellWrapper'

import css from './KeyMetricCell.less'

export const NO_VALUE_PLACEHOLDER = '-'

export type Props = {
    metricConfig: Map<any, any>
    index: number
    loading: boolean | Map<any, any>
    data: List<any>
    meta: Map<any, any>
    id: string
}
const renderDifference = (
    valueTooltipId: string,
    metric: Map<any, any>,
    tooltipDelta: string | null,
) => {
    return (
        <span id={valueTooltipId} className={css.diff}>
            <StatDifference
                label={metric.get('delta')}
                value={metric.get('delta')}
                moreIsBetter={metric.get('more_is_better')}
            />
            <Tooltip placement="top" target={valueTooltipId}>
                {tooltipDelta}
            </Tooltip>
        </span>
    )
}
const defaultWrapper = (
    formattedValue: string | number | null,
    metric: Map<any, any>,
    valueTooltipId: string,
    tooltipDelta: string | null,
) => {
    return (
        <div>
            {formattedValue || formattedValue === 0 ? (
                <div className={css.value}>{formattedValue}</div>
            ) : (
                <div className={css.value}>{NOT_AVAILABLE_LABEL}</div>
            )}
            {renderDifference(valueTooltipId, metric, tooltipDelta)}
        </div>
    )
}
export const formatValue = (value: any, metric: Map<any, any>) => {
    switch (metric.get('type')) {
        case StatType.Number:
            return formatNumber(value)
        case StatType.Duration:
            return formatDuration(value, 2)
        case StatType.Percent:
            return formatPercent(value)
        case StatType.Currency:
            return formatCurrency(value, metric.get('currency'))
        default:
            return value as string
    }
}
export const renderValue = (
    config: Map<any, any>,
    metric: Map<any, any> | null,
    valueTooltipId: string,
    tooltipDelta: string | null,
) => {
    if (!metric) {
        return NO_VALUE_PLACEHOLDER
    }
    const formatData = config.get(
        'formatData',
    ) as StatConfigMetric['formatData']

    if (formatData) {
        return defaultWrapper(
            formatData(metric),
            metric,
            valueTooltipId,
            tooltipDelta,
        )
    }

    const value = metric.get('value') as string | Map<any, any>

    if (_isObject(value)) {
        const formattedValue = fromJS(
            value.reduce(
                (acc, value, key) => ({
                    ...acc,
                    [key]: formatValue(value, metric),
                }),
                {},
            ),
        )

        return (
            <DistributionKeyMetricStat
                config={config}
                formattedValue={formattedValue}
            />
        )
    }

    const formattedValue = formatValue(value, metric)

    return config.get('type') === 'donut' ? (
        <DonutKeyMetricStat
            value={parseFloat(value)}
            maxValue={parseFloat(config.get('maxValue'))}
            fill={config.get('fill')}
            formattedValue={formattedValue as string}
            label={`${metric.get('delta') as number}%`}
            differenceComponent={renderDifference(
                valueTooltipId,
                metric,
                tooltipDelta,
            )}
        />
    ) : (
        defaultWrapper(formattedValue, metric, valueTooltipId, tooltipDelta)
    )
}

export const KeyMetricCell = ({
    metricConfig,
    index,
    loading,
    data,
    meta,
    id,
}: Props) => {
    const metricTooltipId = `title-${id}`
    const valueTooltipId = `value-${id}`
    let previousStartDatetime = null
    let previousEndDatetime = null
    let tooltipDelta = null

    const isFetchingMetric =
        typeof loading === 'boolean'
            ? loading
            : loading.get(metricConfig.get('api_resource_name'))
    const metric = data
        ? data.find((metric: Map<any, any>, j) =>
              metric.get('name')
                  ? metric.get('name') === metricConfig.get('name')
                  : j === index,
          )
        : null

    const tooltip =
        typeof metricConfig.get('tooltip') === 'string'
            ? metricConfig.get('tooltip')
            : (
                  metricConfig.get('tooltip') as (
                      data: Map<any, any>,
                  ) => ReactNode
              )(metric)

    if (meta) {
        previousStartDatetime = moment(meta.get('previous_start_datetime'))
        previousEndDatetime = moment(meta.get('previous_end_datetime'))
        tooltipDelta = formatComparedPeriodString(
            previousStartDatetime,
            previousEndDatetime,
        )
    }

    return (
        <KeyMetricCellWrapper
            label={metricConfig.get('label')}
            tooltipId={metricTooltipId}
            tooltip={tooltip}
        >
            <div className={classnames('mt-3', css.statsDisplay)}>
                {isFetchingMetric ? (
                    <Loader minHeight="90px" size="20px" />
                ) : (
                    renderValue(
                        metricConfig,
                        metric,
                        valueTooltipId,
                        tooltipDelta,
                    )
                )}
            </div>
        </KeyMetricCellWrapper>
    )
}
