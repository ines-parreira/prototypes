import type { ColumnDef } from '@gorgias/axiom'

import type { AgentStatusWithSystem } from '../../types'

export type AgentStatusesTableProps = {
    /** Array of agent statuses to display, two types: static (locally-defined) & custom (from API) */
    data: AgentStatusWithSystem[]
    /** Whether the table is in a loading state */
    isLoading?: boolean
    /** Function to edit a status, cannot edit system statuses */
    onEdit: (status: AgentStatusWithSystem) => void
    /** Function to delete a status, cannot delete system statuses */
    onDelete: (ids: AgentStatusWithSystem['id'][]) => void
}

export type GetColumnsFunction = (
    props: Pick<AgentStatusesTableProps, 'onEdit' | 'onDelete'>,
) => ColumnDef<AgentStatusWithSystem>[]
