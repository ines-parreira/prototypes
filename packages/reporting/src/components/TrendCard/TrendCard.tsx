import type { ReactNode } from 'react'
import { memo } from 'react'

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
import type { MetricCardCompactVariant } from '../MetricCard/MetricCard'
import { MetricCard } from '../MetricCard/MetricCard'
import { MetricCardHeader } from '../MetricCardHeader/MetricCardHeader'
import type { TrendBadgeProps } from '../TrendBadge/TrendBadge'
import { TrendBadge } from '../TrendBadge/TrendBadge'
import type { TrendCardTimeSeriesProps } from '../TrendCardTimeSeries/TrendCardTimeSeries'
import { TrendCardTimeSeries } from '../TrendCardTimeSeries/TrendCardTimeSeries'

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
    compact?: boolean
    trendBadgeTooltipData?: TrendBadgeProps['tooltipData']
    drillDown?: { tooltipText: string; openDrillDownModal: () => void }
    timeSeriesView?: TrendCardTimeSeriesProps
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
        compact = false,
        trendBadgeTooltipData,
        drillDown,
        timeSeriesView,
    }) => {
        const { data } = trend

        const hasData = !isLoading && data?.value != null
        const dataNotEqualToZero = data?.value !== 0

        const formattedMetricValue = hasData
            ? formatMetricValue(data?.value, metricFormat, currency)
            : NOT_AVAILABLE_PLACEHOLDER

        const compactVariant: MetricCardCompactVariant | undefined = compact
            ? timeSeriesView
                ? 'with-sparkline'
                : 'plain'
            : undefined

        return (
            <MetricCard
                withBorder={withBorder}
                withFixedWidth={withFixedWidth}
                compactVariant={compactVariant}
            >
                <MetricCardHeader
                    title={data?.label}
                    hint={hint}
                    actionMenu={actionMenu}
                    compact={compact}
                />

                <div className={css.dataContent}>
                    <div className={css.trendData}>
                        <span className={css.metricData}>
                            {!hasData ? (
                                <Skeleton
                                    height={36}
                                    width={
                                        metricFormat === 'duration' ? 64 : 52
                                    }
                                />
                            ) : drillDown && hasData && dataNotEqualToZero ? (
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
                {timeSeriesView && (
                    <TrendCardTimeSeries
                        {...timeSeriesView}
                        compact={compact}
                    />
                )}
            </MetricCard>
        )
    },
)
