import React from 'react'
import {useAgentsSortingQuery} from 'hooks/reporting/useAgentsSortingQuery'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import {
    HeaderTooltips,
    TableLabels,
    getQuery,
} from 'pages/stats/AgentsTableConfig'
import {TableColumn} from 'state/ui/stats/types'
import {OrderDirection} from 'models/api/types'
import {HintTooltip} from 'pages/stats/common/HintTooltip'

type AgentsHeaderCellContentProps = {
    width?: number | string
    justifyContent?: 'left' | 'right' | 'center'
    column: TableColumn
    className?: string
}

export const AgentsHeaderCellContent = ({
    className,
    column,
    width,
    justifyContent,
}: AgentsHeaderCellContentProps) => {
    const query = getQuery(column)
    const {sortCallback, direction, field} = useAgentsSortingQuery(
        column,
        query
    )
    const tooltip = HeaderTooltips[column]
    const isOrderedBy = column === field

    return (
        <HeaderCellProperty
            direction={
                isOrderedBy && direction === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
            }
            onClick={sortCallback}
            title={TableLabels[column]}
            isOrderedBy={isOrderedBy}
            wrapContent
            width={width}
            justifyContent={justifyContent}
            className={className}
        >
            {tooltip && <HintTooltip {...tooltip} />}
        </HeaderCellProperty>
    )
}
