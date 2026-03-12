import classnames from 'classnames'

import { Icon, Skeleton, Tooltip, TooltipContent } from '@gorgias/axiom'

import { TREND_BADGE_FORMAT } from '../../constants'
import type {
    MetricTrendFormat,
    MetricValueFormat,
    TrendDirection,
} from '../../types'
import {
    formatMetricTrend,
    formatMetricValue,
    getTrendColorFromValue,
    getTrendIconFromSign,
} from '../../utils/helpers'

import styles from './TrendBadge.less'

export type TrendBadgeProps = {
    className?: string
    isLoading?: boolean
    interpretAs?: TrendDirection
    value?: number | null
    prevValue?: number | null
    tooltipData?: {
        period: string
    }
    metricFormat?: MetricValueFormat
    currency?: string
    size?: 'sm' | 'md'
}

export function TrendBadge({
    className,
    value,
    prevValue,
    isLoading = false,
    interpretAs = 'neutral',
    tooltipData,
    metricFormat,
    currency,
    size = 'sm',
}: TrendBadgeProps) {
    const { formattedTrend, sign = 0 } = formatMetricTrend(
        value,
        prevValue,
        (metricFormat as MetricTrendFormat) || TREND_BADGE_FORMAT,
    )

    const trendColor = getTrendColorFromValue(sign, interpretAs)
    const trendIcon = getTrendIconFromSign(sign)

    const formattedPrevValue = formatMetricValue(
        prevValue,
        metricFormat,
        currency,
    )

    if (isLoading) {
        return <Skeleton height={18} width={50} />
    }

    const badgeElement = (
        <div
            className={classnames(
                styles.trend,
                'typography-medium-md',
                styles[`color-${trendColor}`],
                styles[`size-${size}`],
                className,
            )}
        >
            {trendIcon && <Icon name={trendIcon} />}
            {formattedTrend}
        </div>
    )

    if (!tooltipData || formattedPrevValue === null) {
        return badgeElement
    }

    const tooltipTitle = `Compared to ${formattedPrevValue} on ${tooltipData.period}`

    return (
        <Tooltip delay={0} trigger={badgeElement}>
            <TooltipContent title={tooltipTitle} />
        </Tooltip>
    )
}
