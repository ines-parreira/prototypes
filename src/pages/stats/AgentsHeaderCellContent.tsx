import React from 'react'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import {useSortingQueries} from 'hooks/reporting/useSortingQueries'
import {TableLabels} from 'pages/stats/TableConfig'
import {TableColumn} from 'state/ui/stats/types'

export const AgentsHeaderCellContent = ({column}: {column: TableColumn}) => {
    const {sortCallback, direction} = useSortingQueries(column)

    return (
        <HeaderCellProperty
            direction={direction}
            onClick={sortCallback}
            title={TableLabels[column]}
            isOrderedBy
        />
    )
}
