import type { ReactNode } from 'react'
import React from 'react'

import type { OrderDirection } from 'models/api/types'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

type Props = {
    orderDirection: OrderDirection
    orderBy: 'updated_datetime' | undefined
    toggleOrderBy: (column: 'updated_datetime') => void
    children: ReactNode
}

const ActionsPlatformTemplatesTable = ({
    orderDirection,
    orderBy,
    toggleOrderBy,
    children,
}: Props) => {
    return (
        <TableWrapper>
            <TableHead>
                <HeaderCellProperty title="NAME" />
                <HeaderCellProperty
                    justifyContent="right"
                    title="LAST UPDATED"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'updated_datetime'}
                    onClick={() => {
                        toggleOrderBy('updated_datetime')
                    }}
                />
                <HeaderCell />
            </TableHead>
            <TableBody>{children}</TableBody>
        </TableWrapper>
    )
}

export default ActionsPlatformTemplatesTable
