import React from 'react'
import {HintTooltip} from 'pages/stats/common/HintTooltip'
import {useChannelsSortingQuery} from 'hooks/reporting/support-performance/useChannelsSortingQuery'
import {OrderDirection} from 'models/api/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import {
    ChannelColumnConfig,
    ChannelsTableColumns,
    LeadColumn,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'

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
    const {sortCallback, direction, field} = useChannelsSortingQuery(
        column,
        query
    )
    const isOrderedBy = column === field
    const tooltip = ChannelColumnConfig[column].hint

    return (
        <HeaderCellProperty
            isOrderedBy={isOrderedBy}
            direction={
                isOrderedBy && direction === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
            }
            onClick={sortCallback}
            title={ChannelColumnConfig[column].label}
            wrapContent
            justifyContent={column === LeadColumn ? 'left' : 'right'}
            height={'comfortable'}
            width={width}
            className={className}
        >
            {tooltip && <HintTooltip {...tooltip} />}
        </HeaderCellProperty>
    )
}
