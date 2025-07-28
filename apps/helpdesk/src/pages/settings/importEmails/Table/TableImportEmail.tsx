import Navigation from 'pages/common/components/Navigation/Navigation'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { COLUMN_WIDTHS } from './constants'
import { TableRow } from './TableRow'
import { useTableImport } from './useTableImport'

import css from '../ImportEmail.less'

const TableImportEmail = () => {
    const {
        fetchNextItems,
        fetchPrevItems,
        handleSortToggle,
        hasNextItems,
        hasPrevItems,
        importList,
        sortOrder,
    } = useTableImport()

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
