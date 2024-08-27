import React, {ReactNode} from 'react'

import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {OrderDirection} from 'models/api/types'

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
            </TableHead>
            <TableBody>{children}</TableBody>
        </TableWrapper>
    )
}

export default ActionsPlatformTemplatesTable
