import React from 'react'
import {useSortingQueries} from 'hooks/reporting/useSortingQueries'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import {HeaderTooltips, TableLabels, TooltipData} from 'pages/stats/TableConfig'
import {TableColumn} from 'state/ui/stats/types'
import {OrderDirection} from 'models/api/types'

const DOCUMENTATION_LINK_TEXT = 'How is it calculated?'

const HeaderTooltip = ({title, link}: TooltipData) => {
    return (
        <span>
            {title}
            <br />
            <a href={link}>{DOCUMENTATION_LINK_TEXT}</a>
        </span>
    )
}

export const AgentsHeaderCellContent = ({column}: {column: TableColumn}) => {
    const {sortCallback, direction, field} = useSortingQueries(column)
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
            tooltip={tooltip && <HeaderTooltip {...tooltip} />}
        />
    )
}
