import classnames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import { MetricPerChannelQueryHook } from 'domains/reporting/hooks/support-performance/channels/metricsPerChannel'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import heatmapCss from 'domains/reporting/pages/common/components/Table/heatmap.less'
import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { METRIC_COLUMN_WIDTH } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    ChannelColumnConfig,
    LeadColumn,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { getHeatmapMode } from 'domains/reporting/state/ui/stats/channelsSlice'
import { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import useAppSelector from 'hooks/useAppSelector'
import { Channel } from 'models/channel/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

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
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, data } = useMetric(
        cleanStatsFilters,
        userTimezone,
        undefined,
        channel.slug,
    )
    const formattedValue = formatMetricValue(
        data?.value,
        ChannelColumnConfig[column].format,
        NOT_AVAILABLE_PLACEHOLDER,
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
                    heatmapCss[`p${String(data?.decile)}`],
            )}
            innerClassName={classnames(
                [heatmapCss.heatmap],
                isHeatmapMode &&
                    !isFetching &&
                    heatmapCss[`p${String(data?.decile)}`],
                css.cellContent,
                cellContent === NOT_AVAILABLE_PLACEHOLDER && css.emptyValue,
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
                    highlighted={!isHeatmapMode}
                    metricData={{
                        metricName: column,
                        perChannel: channel.slug,
                    }}
                >
                    {cellContent}
                </DrillDownModalTrigger>
            ) : (
                <TruncateCellContent content={cellContent} />
            )}
        </BodyCell>
    )
}
