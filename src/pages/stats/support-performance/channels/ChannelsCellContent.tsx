import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {MetricPerChannelQueryHook} from 'hooks/reporting/metricsPerChannel'
import useAppSelector from 'hooks/useAppSelector'
import {Channel} from 'models/channel/types'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/AnalyticsTable.less'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import heatmapCss from 'pages/stats/heatmap.less'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    ChannelColumnConfig,
    LeadColumn,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {TruncateCellContent} from 'pages/stats/TruncateCellContent'
import {getHeatmapMode} from 'state/ui/stats/channelsSlice'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'
import {ChannelsTableColumns} from 'state/ui/stats/types'

export const ChannelsCellContent = ({
    column,
    channel,
    className,
    isLoading = false,
    useMetric,
    width,
}: {
    channel: Channel
    column: ChannelsTableColumns
    className?: string
    isLoading?: boolean
    width: number
    useMetric: MetricPerChannelQueryHook
}) => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    const isHeatmapMode = useAppSelector(getHeatmapMode)
    const {cleanStatsFilters: LegacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {cleanStatsFilters: statsFiltersWithLogicalOperators, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)
    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : LegacyStatsFilters

    const {isFetching, data} = useMetric(
        cleanStatsFilters,
        userTimezone,
        undefined,
        channel.slug
    )
    const formattedValue = formatMetricValue(
        data?.value,
        ChannelColumnConfig[column].format,
        NOT_AVAILABLE_PLACEHOLDER
    )

    const cellContent = column === LeadColumn ? channel.name : formattedValue

    return (
        <BodyCell
            width={width}
            className={classnames(
                className,
                [heatmapCss.heatmap],
                isHeatmapMode &&
                    !isFetching &&
                    heatmapCss[`p${String(data?.decile)}`]
            )}
            innerClassName={classnames(
                [heatmapCss.heatmap],
                isHeatmapMode &&
                    !isFetching &&
                    heatmapCss[`p${String(data?.decile)}`],
                css.cellContent,
                cellContent === NOT_AVAILABLE_PLACEHOLDER && css.emptyValue
            )}
            justifyContent={column === LeadColumn ? 'left' : 'right'}
            size={'small'}
        >
            {isFetching || isLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : column !== LeadColumn ? (
                <DrillDownModalTrigger
                    enabled={
                        !!data?.value &&
                        column !== ChannelsTableColumns.CreatedTicketsPercentage
                    }
                    metricData={{
                        metricName: column,
                        perChannel: channel.slug,
                    }}
                    useNewFilterData={isAnalyticsNewFilters}
                >
                    {cellContent}
                </DrillDownModalTrigger>
            ) : (
                <TruncateCellContent content={cellContent} />
            )}
        </BodyCell>
    )
}
