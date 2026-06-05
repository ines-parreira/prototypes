import { UserAvatar } from '@repo/users'

import { DataTableTextCell } from '@gorgias/axiom'
import type { DataTableColumnDef } from '@gorgias/axiom'

import {
    AVAILABILITY_COLUMN_ID,
    ONLINE_STATUS_COLUMN_ID,
} from 'domains/reporting/pages/live/agents/dataTable/constants'
import type {
    LiveAgentMetricAxis,
    LiveAgentRow,
} from 'domains/reporting/pages/live/agents/dataTable/types'

import { AvailabilityCell } from './cells/AvailabilityCell'
import { LiveAgentMetricCell } from './cells/LiveAgentMetricCell'
import { OnlineStateCell } from './cells/OnlineStateCell'

/** Compact, numeric metric columns that shrink to fit their content. */
const HUG_METRIC_NAMES = new Set(['Tickets closed', 'Messages sent'])

/** Fixed width (px) for the Availability column so custom status names fit. */
const AVAILABILITY_COLUMN_WIDTH = 160

/**
 * No-op accessor that makes a display column sortable (TanStack only marks a
 * column sortable when it has an accessorFn). The value is never used: sorting
 * is manual and applied by `useLiveAgentsTableData`.
 */
const SORTABLE_DISPLAY_COLUMN_ACCESSOR = (): null => null

type GetLiveAgentsColumnsParams = {
    metricAxes: LiveAgentMetricAxis[]
    isAgentAvailabilityEnabled: boolean
}

/**
 * Builds the DataTable columns. The Agent (with avatar) and realtime Online
 * status columns are always present; the Availability column is injected after
 * Online status when the feature flag is enabled; metric columns follow the
 * stat axis order. Agents are searched via the table's search box.
 */
export function getLiveAgentsColumns({
    metricAxes,
    isAgentAvailabilityEnabled,
}: GetLiveAgentsColumnsParams): DataTableColumnDef<LiveAgentRow>[] {
    const columns: DataTableColumnDef<LiveAgentRow>[] = [
        {
            accessorKey: 'userName',
            header: 'Agent',
            cell: (info) => (
                <DataTableTextCell
                    {...info}
                    variant="bold"
                    overflow="ellipsis"
                    leadingSlot={
                        <UserAvatar
                            user={info.row.original.user}
                            size="sm"
                            withStatus={false}
                        />
                    }
                />
            ),
        },
        {
            id: ONLINE_STATUS_COLUMN_ID,
            header: 'Online',
            // A column is only sortable when it has an accessorFn. Online status
            // and availability live outside the row (realtime/cache), so this is
            // a no-op accessor purely to enable the sortable header — the actual
            // ordering is done manually in `useLiveAgentsTableData`.
            accessorFn: SORTABLE_DISPLAY_COLUMN_ACCESSOR,
            enableSorting: true,
            hug: true,
            cell: (cell) => <OnlineStateCell {...cell} />,
        },
    ]

    if (isAgentAvailabilityEnabled) {
        columns.push({
            id: AVAILABILITY_COLUMN_ID,
            header: 'Availability',
            accessorFn: SORTABLE_DISPLAY_COLUMN_ACCESSOR,
            enableSorting: true,
            // Fixed width rather than `hug`: the status select renders custom
            // status names that a hugged (content-measured) column clips.
            // size/min/max are equal so the column is truly fixed — otherwise it
            // stretches to absorb the table's slack in `constrain` mode.
            size: AVAILABILITY_COLUMN_WIDTH,
            minSize: AVAILABILITY_COLUMN_WIDTH,
            maxSize: AVAILABILITY_COLUMN_WIDTH,
            cell: (info) => <AvailabilityCell {...info} />,
        })
    }

    metricAxes.forEach((axis) => {
        columns.push({
            id: axis.name,
            header: axis.name,
            hug: HUG_METRIC_NAMES.has(axis.name),
            // Metric values live in context (not the row); the no-op accessor
            // just enables the sortable header — ordering is done manually in
            // `useLiveAgentsTableData`.
            accessorFn: SORTABLE_DISPLAY_COLUMN_ACCESSOR,
            enableSorting: true,
            cell: (cell) => (
                <LiveAgentMetricCell axisName={axis.name} cell={cell} />
            ),
        })
    })

    return columns
}
