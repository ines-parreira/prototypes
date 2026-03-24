import { useChannelsSortingQuery } from 'domains/reporting/hooks/support-performance/useChannelsSortingQuery'
import { HintTooltipContent } from 'domains/reporting/pages/common/HintTooltip'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
    LeadColumn,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import type { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

type ChannelsHeaderCellContentProps = {
    column: ChannelsTableColumns
    width: number
    className?: string
}

export const ChannelsHeaderCellContent = ({
    className,
    column,
    width,
}: ChannelsHeaderCellContentProps) => {
    const query = ChannelColumnConfig[column].useMetric
    const { sortCallback, direction, field } = useChannelsSortingQuery(
        column,
        query,
    )
    const isOrderedBy = column === field
    const tooltip = ChannelColumnConfig[column].hint
    const tooltipContent = tooltip ? <HintTooltipContent {...tooltip} /> : null

    return (
        <HeaderCellProperty
            isOrderedBy={isOrderedBy}
            direction={isOrderedBy ? direction : undefined}
            onClick={sortCallback}
            title={ChannelsTableLabels[column]}
            wrapContent
            justifyContent={column === LeadColumn ? 'left' : 'right'}
            height={'comfortable'}
            width={width}
            className={className}
            tooltip={tooltipContent}
        />
    )
}
