import type { ReactNode } from 'react'
import { memo, useState } from 'react'

import { Box, Skeleton } from '@gorgias/axiom'

import { NOT_AVAILABLE_PLACEHOLDER } from '../../constants'
import type {
    MetricTrend,
    MetricTrendFormat,
    TooltipData,
    TrendDirection,
} from '../../types'
import { formatMetricValue } from '../../utils/helpers'
import { DrillDownModalTrigger } from '../DrillDownModal/DrillDownModalTrigger'
import { MetricCard } from '../MetricCard/MetricCard'
import { MetricCardHeader } from '../MetricCardHeader/MetricCardHeader'
import type { TrendBadgeProps } from '../TrendBadge/TrendBadge'
import { TrendBadge } from '../TrendBadge/TrendBadge'

import css from './TrendCard.less'

export type TrendCardProps = {
    actionMenu?: ReactNode
    currency?: string
    hint?: TooltipData
    interpretAs: TrendDirection
    isLoading?: boolean
    metricFormat?: MetricTrendFormat
    trend: MetricTrend
    withBorder?: boolean
    withFixedWidth?: boolean
    trendBadgeTooltipData?: TrendBadgeProps['tooltipData']
    drillDown?: { tooltipText: string; openDrillDownModal: () => void }
}

export const TrendCard = memo<TrendCardProps>(
    ({
        actionMenu,
        currency,
        hint,
        interpretAs,
        isLoading = false,
        metricFormat,
        trend,
        withBorder,
        withFixedWidth,
        trendBadgeTooltipData,
        drillDown,
    }) => {
        const { data } = trend
        const [isHovered, setIsHovered] = useState(false)

        const hasData =
            !isLoading && data?.value !== null && data?.value !== undefined

        const formattedMetricValue = hasData
            ? formatMetricValue(data?.value, metricFormat, currency)
            : NOT_AVAILABLE_PLACEHOLDER

        return (
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <MetricCard
                    withBorder={withBorder}
                    withFixedWidth={withFixedWidth}
                >
                    <MetricCardHeader
                        title={data?.label}
                        hint={hint}
                        actionMenu={isHovered ? actionMenu : undefined}
                    />

                    <div className={css.dataContent}>
                        <div className={css.trendData}>
                            <span className={css.metricData}>
                                {!hasData ? (
                                    <Skeleton
                                        height={36}
                                        width={
                                            metricFormat === 'duration'
                                                ? 64
                                                : 52
                                        }
                                    />
                                ) : drillDown && hasData ? (
                                    <DrillDownModalTrigger
                                        enabled={hasData}
                                        tooltipText={drillDown.tooltipText}
                                        openDrillDownModal={
                                            drillDown.openDrillDownModal
                                        }
                                    >
                                        {formattedMetricValue}
                                    </DrillDownModalTrigger>
                                ) : (
                                    formattedMetricValue
                                )}
                            </span>
                            {!hasData && (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    height="14px"
                                >
                                    <Skeleton
                                        height={14}
                                        width={14}
                                        style={{ marginTop: '5px' }}
                                    />
                                </Box>
                            )}
                            {hasData && (
                                <TrendBadge
                                    value={data?.value}
                                    prevValue={data?.prevValue}
                                    metricFormat={metricFormat}
                                    interpretAs={interpretAs}
                                    currency={currency}
                                    tooltipData={trendBadgeTooltipData}
                                />
                            )}
                        </div>
                    </div>
                </MetricCard>
            </div>
        )
    },
)
