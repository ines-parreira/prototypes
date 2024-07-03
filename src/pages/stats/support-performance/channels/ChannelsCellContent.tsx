import classnames from 'classnames'
import React from 'react'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/AgentsTableConfig'
import {MetricPerChannelQueryHook} from 'hooks/reporting/metricsPerChannel'
import {Channel} from 'models/channel/types'
import useAppSelector from 'hooks/useAppSelector'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/AgentsTable.less'
import heatmapCss from 'pages/stats/heatmap.less'
import {
    ChannelColumnConfig,
    ChannelsTableColumns,
    LeadColumn,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {getHeatmapMode} from 'state/ui/stats/channelsSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

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
    const isHeatmapMode = useAppSelector(getHeatmapMode)
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
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
                >
                    {cellContent}
                </DrillDownModalTrigger>
            ) : (
                cellContent
            )}
        </BodyCell>
    )
}
