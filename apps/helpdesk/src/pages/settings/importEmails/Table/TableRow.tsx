import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {
    getDateRange,
    getProviderIcon,
    getStatusBadge,
} from 'pages/settings/importEmails/Table/utils'

import { ImportItem } from '../types'
import { COLUMN_WIDTHS } from './constants'

import css from '../ImportEmail.less'

type TableRowProps = {
    importItem: ImportItem
}

export const TableRow = ({ importItem }: TableRowProps) => {
    return (
        <TableBodyRow key={importItem.id}>
            <BodyCell
                width={COLUMN_WIDTHS.email}
                size="small"
                className={css.noCursor}
            >
                {getProviderIcon(importItem.provider)}
                <span className={css.emailColumn}>{importItem.email}</span>
            </BodyCell>
            <BodyCell
                width={COLUMN_WIDTHS.importData}
                size="small"
                className={css.noCursor}
            >
                <div className={css.importStats}>
                    <span>{importItem.emailCount.toLocaleString()} emails</span>
                    <p>
                        {getDateRange(
                            importItem.import_window_start,
                            importItem.import_window_end,
                        )}
                    </p>
                </div>
            </BodyCell>
            <BodyCell
                width={COLUMN_WIDTHS.status}
                size="small"
                className={css.noCursor}
            >
                {getStatusBadge(
                    importItem.status,
                    importItem.progressPercentage,
                )}
            </BodyCell>
        </TableBodyRow>
    )
}
