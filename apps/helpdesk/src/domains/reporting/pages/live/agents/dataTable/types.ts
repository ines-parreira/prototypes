import type { User } from '@gorgias/helpdesk-queries'

import type { StatType } from 'domains/reporting/models/stat/types'

export type LiveAgentMetricAxis = {
    name: string
    type: StatType
}

/**
 * A single metric value for an agent, normalized from the stats response.
 * Only the fields relevant to `type` are populated:
 * - `TicketDetails` → `value` (open tickets) + `details` (per-channel breakdown)
 * - everything else → `value`
 */
export type LiveAgentMetricCell = {
    type: StatType
    value?: number | string | boolean | null
    details?: Partial<Record<string, number>>
}

export type LiveAgentRow = {
    userId: number
    userName: string
    user: User
}

export type LiveAgentFilterOption = {
    id: number
    name: string
}
