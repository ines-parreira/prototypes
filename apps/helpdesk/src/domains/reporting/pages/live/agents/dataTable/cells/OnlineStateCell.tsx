import { useUserStatus } from '@repo/users'

import { DataTableBaseCell, Tag } from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'

import type { LiveAgentRow } from 'domains/reporting/pages/live/agents/dataTable/types'

export function OnlineStateCell(cell: CellContext<LiveAgentRow, unknown>) {
    const { status } = useUserStatus(cell.row.original.userId)
    const isOnline = status === 'online'

    return (
        <DataTableBaseCell {...cell}>
            <Tag color={isOnline ? 'green' : 'grey'}>
                {isOnline ? 'Online' : 'Offline'}
            </Tag>
        </DataTableBaseCell>
    )
}
