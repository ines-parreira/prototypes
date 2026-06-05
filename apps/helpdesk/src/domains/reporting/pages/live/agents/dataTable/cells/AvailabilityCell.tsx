import { useCallback } from 'react'

import type { AgentStatusWithSystem } from '@repo/agent-status'
import {
    useSelectableAgentAvailabilityStatuses,
    useUserAvailabilityStatus,
} from '@repo/agent-status'
import { isAdmin, isTeamLead } from '@repo/permissions'
import { useUpdateUserAvailability } from '@repo/users'

import {
    DataTableSelectCell,
    DataTableTextCell,
    Dot,
    ListItem,
    toast,
} from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'

import type { LiveAgentRow } from 'domains/reporting/pages/live/agents/dataTable/types'
import useAppSelector from 'hooks/useAppSelector'

const AVAILABLE_STATUS_ID = 'available'
const UNAVAILABLE_STATUS_ID = 'unavailable'
const EMPTY_VALUE = '—'

/** Available agents get a green dot; everything else (unavailable/custom) orange. */
function getStatusDotColor(status: AgentStatusWithSystem): 'green' | 'orange' {
    return status.id === AVAILABLE_STATUS_ID ? 'green' : 'orange'
}

/**
 * Availability cell rendering the agent's status as an inline select with a
 * leading dot in the status color. Admins and team leads can change the status;
 * everyone else sees a read-only dot + label. Availability resolves from the
 * shared (globally loaded) availability cache, so there is no per-agent fetch.
 */
export function AvailabilityCell(cell: CellContext<LiveAgentRow, unknown>) {
    const { userId } = cell.row.original
    const { allStatuses } = useSelectableAgentAvailabilityStatuses()
    const { status } = useUserAvailabilityStatus({ userId })
    const { update } = useUpdateUserAvailability(userId)
    const currentUser = useAppSelector((state) => state.currentUser)

    const canEditStatus =
        isAdmin(currentUser.toJS()) || isTeamLead(currentUser.toJS())

    const handleChange = useCallback(
        async (next: AgentStatusWithSystem | null) => {
            if (!next) {
                return
            }
            try {
                await (next.id === AVAILABLE_STATUS_ID ||
                next.id === UNAVAILABLE_STATUS_ID
                    ? update(next.id)
                    : update('custom', next.id))
            } catch {
                toast.error('Failed to update status. Please try again.')
            }
        },
        [update],
    )

    if (!status) {
        return <DataTableTextCell {...cell}>{EMPTY_VALUE}</DataTableTextCell>
    }

    if (!canEditStatus) {
        return (
            <DataTableTextCell
                {...cell}
                leadingSlot={<Dot color={getStatusDotColor(status)} />}
            >
                {status.name}
            </DataTableTextCell>
        )
    }

    return (
        <DataTableSelectCell
            {...cell}
            items={allStatuses}
            value={status}
            onChange={handleChange}
            aria-label="Agent availability"
            leadingSlot={<Dot color={getStatusDotColor(status)} />}
        >
            {(option) => (
                <ListItem
                    leadingSlot={<Dot color={getStatusDotColor(option)} />}
                    label={option.name}
                />
            )}
        </DataTableSelectCell>
    )
}
