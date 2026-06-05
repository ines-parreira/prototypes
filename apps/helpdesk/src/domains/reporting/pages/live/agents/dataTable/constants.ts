import { StatType } from 'domains/reporting/models/stat/types'
import type { LiveAgentMetricAxis } from 'domains/reporting/pages/live/agents/dataTable/types'

/** The Agent column's `accessorKey`; used as the manual-sort id for the name. */
export const AGENTS_FILTER_ID = 'userName'

/** Display-column ids (used for both the column defs and manual sorting). */
export const ONLINE_STATUS_COLUMN_ID = 'onlineStatus'
export const AVAILABILITY_COLUMN_ID = 'availability'

/**
 * The metric columns the `users-performance-overview` stat produces, in order.
 * Rendered as placeholder columns while the stats load so the column set — and
 * therefore the layout — stays stable instead of shifting in once the request
 * resolves. Kept in sync with `parseUserPerformanceStat`; the real axes from the
 * response replace these as soon as they arrive.
 */
export const LIVE_AGENTS_FALLBACK_METRIC_AXES: LiveAgentMetricAxis[] = [
    { name: 'Tickets closed', type: StatType.Number },
    { name: 'Messages sent', type: StatType.Number },
    { name: 'Open tickets', type: StatType.TicketDetails },
]
