import classnames from 'classnames'

import { Skeleton, Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import { getTrendColorFromSign } from 'pages/stats/common/components/TrendBadge/helper'
import css from 'pages/stats/common/components/TrendBadge/TrendBadge.less'
import { TrendIcon } from 'pages/stats/common/components/TrendIcon'
import {
    formatMetricTrend,
    formatMetricValue,
    MetricTrendFormat,
} from 'pages/stats/common/utils'

const getTooltipText = (prevValue: string, period: string) => (
    <>
        Vs. <strong>{prevValue}</strong> on {period}
    </>
)

export const TREND_BADGE_FORMAT = 'percent'
export const DEFAULT_BADGE_TEXT = '0%'

export type InterpretAs = 'more-is-better' | 'less-is-better' | 'neutral'

type Props = {
    className?: string
    isLoading?: boolean
    interpretAs?: InterpretAs
    value?: number | null
    prevValue?: number | null
    tooltipData?: {
        period: string
    }
    metricFormat?: MetricTrendFormat
    currency?: string
}

export default function TrendBadge({
    className,
    value,
    prevValue,
    isLoading = false,
    interpretAs = 'neutral',
    tooltipData,
    metricFormat,
    currency,
}: Props) {
    const id = useId()
    const badgeId = `badge-${id}`

    const { formattedTrend, sign = 0 } =
        value != null && prevValue != null
            ? formatMetricTrend(value, prevValue, TREND_BADGE_FORMAT)
            : { formattedTrend: null }

    const trendColor = getTrendColorFromSign(sign, interpretAs)

    if (isLoading) {
        return <Skeleton height={18} width={50} />
    }

    return (
        <>
            <div
                className={classnames(css.trend, css[trendColor], className)}
                id={badgeId}
            >
                <TrendIcon sign={sign} />
                {`${formattedTrend ?? DEFAULT_BADGE_TEXT}`}
            </div>
            {tooltipData && formattedTrend && (
                <Tooltip target={`#${badgeId}`}>
                    {getTooltipText(
                        formatMetricValue(
                            prevValue,
                            metricFormat,
                            undefined,
                            currency,
                        ),
                        tooltipData.period,
                    )}
                </Tooltip>
            )}
        </>
    )
}
