import React from 'react'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import Pagination from 'pages/common/components/Pagination'
import useClientSidePagination from 'pages/common/hooks/useClientSidePagination'

import css from './StartMigrationIntegrationsTable.less'

export default function StartMigrationIntegrationsTable() {
    const {page, pageCount, paginatedItems, onPageChange} =
        useClientSidePagination({
            items: Array.from(Array(4).keys()),
            itemsPerPage: 3,
        })

    return (
        <div className={css.container}>
            <TableWrapper className={css.table}>
                <TableHead>
                    <HeaderCellProperty title="Email" />
                </TableHead>
                <TableBody>
                    {paginatedItems.map((item) => (
                        <TableBodyRow key={item}>
                            <BodyCell>{item}</BodyCell>
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
            <Pagination
                pageCount={pageCount}
                onChange={onPageChange}
                currentPage={page}
            />
        </div>
    )
}
