import { useId } from '@repo/hooks'
import { TrendIcon } from '@repo/reporting'
import classnames from 'classnames'

import { Skeleton, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { getTrendColorFromSign } from 'domains/reporting/pages/common/components/TrendBadge/helper'
import css from 'domains/reporting/pages/common/components/TrendBadge/TrendBadge.less'
import {
    formatMetricTrend,
    formatMetricValue,
    MetricValueFormat,
} from 'domains/reporting/pages/common/utils'

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
    metricFormat?: MetricValueFormat
    currency?: string
    size?: 'sm' | 'md'
}

/**
 * @deprecated This component has been replaced by TrendBadge from @repo/reporting
 * @date 2025-09-23
 * @type reporting-ui-kit
 */
export default function TrendBadge({
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
                className={classnames(
                    css.trend,
                    css[trendColor],
                    css[size],
                    className,
                )}
                id={badgeId}
            >
                <TrendIcon value={sign} />
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
