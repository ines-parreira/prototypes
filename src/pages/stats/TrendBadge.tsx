import classnames from 'classnames'
import React from 'react'
import useId from 'hooks/useId'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import Tooltip from 'pages/common/components/Tooltip'
import {
    formatMetricTrend,
    MetricTrendFormat,
    NOT_AVAILABLE_TEXT,
} from './common/utils'
import css from './TrendBadge.less'

type Props = {
    className?: string
    isLoading?: boolean
    interpretAs?: 'more-is-better' | 'less-is-better' | 'neutral'
    value?: number | null
    prevValue?: number | null
    format?: MetricTrendFormat
    tooltip?: string
}

export default function TrendBadge({
    className,
    value,
    prevValue,
    isLoading = false,
    interpretAs = 'neutral',
    format = 'decimal',
    tooltip,
}: Props) {
    const id = useId()
    const badgeId = `badge-${id}`

    const {formattedTrend, sign = 0} =
        value != null && prevValue != null
            ? formatMetricTrend(value, prevValue, format)
            : {formattedTrend: NOT_AVAILABLE_TEXT}

    let trendColor = 'neutral'
    if (interpretAs === 'more-is-better') {
        trendColor = sign > 0 ? 'positive' : sign < 0 ? 'negative' : 'neutral'
    } else if (interpretAs === 'less-is-better') {
        trendColor = sign > 0 ? 'negative' : sign < 0 ? 'positive' : 'neutral'
    }

    if (isLoading) {
        return <Skeleton height={18} width={50} />
    }

    return formattedTrend ? (
        <>
            <div
                className={classnames(css.trend, css[trendColor], className)}
                id={badgeId}
            >
                {`${sign > 0 ? '+' : sign < 0 ? '-' : ''}${formattedTrend}`}
            </div>
            {tooltip && <Tooltip target={`#${badgeId}`}>{tooltip}</Tooltip>}
        </>
    ) : null
}
