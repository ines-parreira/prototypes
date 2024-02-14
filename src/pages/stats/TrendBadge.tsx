import classnames from 'classnames'
import React from 'react'
import useId from 'hooks/useId'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import Tooltip from 'pages/common/components/Tooltip'
import {formatMetricTrend, MetricTrendFormat} from './common/utils'
import css from './TrendBadge.less'
import {getIconNameBySign} from './utils'

const getTooltipText = (prevValue: string, period: string) => (
    <>
        Vs. <strong>{prevValue}</strong> on {period}
    </>
)

type Props = {
    className?: string
    isLoading?: boolean
    interpretAs?: 'more-is-better' | 'less-is-better' | 'neutral'
    value?: number | null
    prevValue?: number | null
    format?: MetricTrendFormat
    tooltipData?: {
        period: string
    }
}

export const DEFAULT_BADGE_TEXT = '0%'

export default function TrendBadge({
    className,
    value,
    prevValue,
    isLoading = false,
    interpretAs = 'neutral',
    format = 'decimal',
    tooltipData,
}: Props) {
    const id = useId()
    const badgeId = `badge-${id}`

    const {formattedTrend, sign = 0} =
        value != null && prevValue != null
            ? formatMetricTrend(value, prevValue, format)
            : {formattedTrend: null}

    let trendColor = sign > 0 || sign < 0 ? 'neutral' : 'unchanged'
    if (interpretAs === 'more-is-better') {
        trendColor = sign > 0 ? 'positive' : sign < 0 ? 'negative' : 'unchanged'
    } else if (interpretAs === 'less-is-better') {
        trendColor = sign > 0 ? 'negative' : sign < 0 ? 'positive' : 'unchanged'
    }

    if (isLoading) {
        return <Skeleton height={18} width={50} />
    }

    return (
        <>
            <div
                className={classnames(css.trend, css[trendColor], className)}
                id={badgeId}
            >
                {!!sign ? (
                    <i
                        className="material-icons-round mr-1 icon"
                        style={{fontSize: 12}}
                    >
                        {getIconNameBySign(sign)}
                    </i>
                ) : null}
                {`${formattedTrend ?? DEFAULT_BADGE_TEXT}`}
            </div>
            {tooltipData && formattedTrend && (
                <Tooltip target={`#${badgeId}`}>
                    {getTooltipText(formattedTrend, tooltipData.period)}
                </Tooltip>
            )}
        </>
    )
}
