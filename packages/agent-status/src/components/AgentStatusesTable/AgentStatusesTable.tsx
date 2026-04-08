import {
    TableHeader,
    TableV1BodyContent,
    TableV1HeaderRowGroup,
    TableV1Root,
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
        <TableV1Root width="full" aria-label="Agent availability statuses">
            <TableHeader>
                <TableV1HeaderRowGroup headerGroups={table.getHeaderGroups()} />
            </TableHeader>

            <TableV1BodyContent
                isLoading={isLoading}
                rows={table.getRowModel().rows}
                columnCount={table.getAllColumns().length}
                table={table}
            />
        </TableV1Root>
    )
}
