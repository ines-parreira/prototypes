import { useMemo } from 'react'

import type { TableV1Instance } from '@gorgias/axiom'
import { useTable } from '@gorgias/axiom'

import { getColumns } from '../components/AgentStatusesTable/columns'
import type { AgentStatusWithSystem } from '../types'

export type UseAgentStatusTableOptions = {
    data: AgentStatusWithSystem[]
    onEdit: (status: AgentStatusWithSystem) => void
    onDelete: (ids: AgentStatusWithSystem) => void
}

export type UseAgentStatusTableReturn = {
    table: TableV1Instance<AgentStatusWithSystem>
}

export function useAgentStatusTable({
    data,
    onEdit,
    onDelete,
}: UseAgentStatusTableOptions): UseAgentStatusTableReturn {
    const columns = useMemo(
        () => getColumns({ onEdit, onDelete }),
        [onEdit, onDelete],
    )

    const table = useTable<AgentStatusWithSystem>({
        data,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
        },
        paginationConfig: {
            enablePagination: false,
        },
        selectionConfig: {
            enableRowSelection: false,
        },
        additionalOptions: {
            getRowId: (row) => row.id,
        },
    })

    return { table }
}
