import { LoadingSpinner } from '@gorgias/axiom'

import { OrderDirection } from 'models/api/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { ImportItem } from '../types'
import { COLUMN_WIDTHS } from './constants'
import EmptyState from './EmptyState'
import { TableRow } from './TableRow'

import css from '../ImportEmail.less'

type TableImportEmailProps = {
    onOpenCreateImportModal: () => void
    isLoading: boolean
    importList: ImportItem[]
    hasNextItems: boolean
    hasPrevItems: boolean
    fetchNextItems: () => void
    fetchPrevItems: () => void
    handleSortToggle: () => void
    sortOrder: OrderDirection
}

const TableImportEmail = ({
    onOpenCreateImportModal,
    isLoading,
    importList,
    hasNextItems,
    hasPrevItems,
    fetchNextItems,
    fetchPrevItems,
    handleSortToggle,
    sortOrder,
}: TableImportEmailProps) => {
    if (isLoading) {
        return (
            <div className={css.emptyStateWrapper}>
                <LoadingSpinner />
            </div>
        )
    }

    if (!isLoading && importList.length === 0) {
        return <EmptyState onOpenCreateImportModal={onOpenCreateImportModal} />
    }

    return (
        <>
            <TableWrapper className="import-email">
                <TableHead>
                    <HeaderCellProperty
                        title="Email"
                        width={COLUMN_WIDTHS.email}
                        className={css.headerCell}
                        justifyContent="left"
                    />
                    <HeaderCellProperty
                        title="Import data"
                        width={COLUMN_WIDTHS.importData}
                        className={css.headerCell}
                    />
                    <HeaderCellProperty
                        title="Status"
                        width={COLUMN_WIDTHS.status}
                        className={css.headerCell}
                        onClick={handleSortToggle}
                        direction={sortOrder}
                        isOrderedBy
                    />
                </TableHead>
                <TableBody>
                    {importList.map((importItem) => (
                        <TableRow key={importItem.id} importItem={importItem} />
                    ))}
                </TableBody>
            </TableWrapper>
            <Navigation
                className="pl-4 b-4"
                hasNextItems={hasNextItems}
                hasPrevItems={hasPrevItems}
                fetchNextItems={fetchNextItems}
                fetchPrevItems={fetchPrevItems}
            />
        </>
    )
}

export default TableImportEmail
