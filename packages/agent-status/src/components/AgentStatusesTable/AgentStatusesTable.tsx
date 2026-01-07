import {
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
} from '@gorgias/axiom'

import { useAgentStatusTable } from '../../hooks'
import type { AgentStatusesTableProps } from './types'

/**
 * Table displaying system statuses + custom statuses from API.
 * System statuses shown first, cannot be edited/deleted.
 */
export function AgentStatusesTable({
    data,
    isLoading = false,
    onEdit,
    onDelete,
}: AgentStatusesTableProps) {
    const { table } = useAgentStatusTable({ data, onEdit, onDelete })

    return (
        <TableRoot width="full" aria-label="Agent availability statuses">
            <TableHeader>
                <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
            </TableHeader>

            <TableBodyContent
                isLoading={isLoading}
                rows={table.getRowModel().rows}
                columnCount={table.getAllColumns().length}
                table={table}
            />
        </TableRoot>
    )
}
