import { useId } from '@repo/hooks'
import classnames from 'classnames'

import { Icon, Skeleton, Tooltip } from '@gorgias/axiom'

import { TREND_BADGE_FORMAT } from '../../constants'
import { MetricValueFormat, TrendDirection } from '../../types'
import {
    formatMetricTrend,
    formatMetricValue,
    getTrendColorFromValue,
    getTrendIconFromSign,
} from '../../utils/helpers'

import styles from './TrendBadge.less'

type Props = {
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
}: Props) {
    const id = useId()
    const badgeId = `badge-${id}`

    const { formattedTrend, sign = 0 } = formatMetricTrend(
        value,
        prevValue,
        TREND_BADGE_FORMAT,
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

    return (
        <>
            <div
                className={classnames(
                    styles.trend,
                    styles[`color-${trendColor}`],
                    styles[`size-${size}`],
                    className,
                )}
                id={badgeId}
            >
                {trendIcon && <Icon name={trendIcon} />}
                {formattedTrend}
            </div>
            <Tooltip
                target={badgeId}
                disabled={!tooltipData || formattedPrevValue === null}
            >
                Vs. <strong>{formattedPrevValue}</strong> on{' '}
                {tooltipData?.period}
            </Tooltip>
        </>
    )
}
