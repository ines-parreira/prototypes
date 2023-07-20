import React from 'react'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {TableColumn, TableLabels} from 'pages/stats/TableConfig'

export const HeaderCell = ({column}: {column: TableColumn}) => {
    return <BodyCell>{TableLabels[column]}</BodyCell>
}
