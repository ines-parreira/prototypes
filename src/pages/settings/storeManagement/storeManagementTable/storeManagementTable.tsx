import React from 'react'

import Loader from 'pages/common/components/Loader/Loader'
import { NumberedPagination } from 'pages/common/components/Paginations'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { useStoreManagementState } from '../StoreManagementProvider'
import { columnsOrder, TableLabels } from './StoreManagementTableConfig'
import StoreManagementTableRow from './StoreManagementTableRow/StoreManagementTableRow'

import css from './StoreManagementTable.less'

export const StoreManagementTable = () => {
    const {
        currentPage,
        totalPages,
        paginatedStores,
        setCurrentPage,
        isLoading,
    } = useStoreManagementState()

    const onPageChangeCallback = (page: number) => {
        setCurrentPage(page)
    }

    if (isLoading) {
        return <Loader role="status" aria-label="Loading..." />
    }

    return (
        <>
            <div className={css.container}>
                <TableWrapper className={css.table}>
                    <thead>
                        <tr className={css.headerRow}>
                            {columnsOrder.map((column) => (
                                <HeaderCellProperty
                                    key={`header-cell-${column}`}
                                    title={TableLabels[column]}
                                    justifyContent="left"
                                    className={css.headerCell}
                                    titleClassName={css.headerCellTitle}
                                />
                            ))}
                            <HeaderCell key="cell-for-spacing" />
                        </tr>
                    </thead>

                    <TableBody>
                        {paginatedStores.map((store) => (
                            <StoreManagementTableRow
                                key={store.store.id}
                                store={store}
                            />
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {totalPages > 1 && (
                    <NumberedPagination
                        count={totalPages}
                        page={currentPage}
                        onChange={onPageChangeCallback}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}
