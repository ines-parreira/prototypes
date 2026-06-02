import type { NameColumnConfig } from '@repo/reporting'

import { PERFORMANCE_OVERVIEW_BREAKDOWN_METRIC_COLUMNS } from 'domains/reporting/pages/performance/overview/config/breakdownTableMetrics'
import { humanizeChannel } from 'state/ticket/utils'

export const PERFORMANCE_OVERVIEW_CHANNEL_NAME_COLUMNS: NameColumnConfig[] = [
    { accessor: 'entity', label: 'Channel', formatName: humanizeChannel },
]

export const PERFORMANCE_OVERVIEW_CHANNEL_TABLE = {
    title: 'Channel',
    description:
        'Performance metrics per channel: resolution time, first response time, messages per ticket, average CSAT, ticket volume, and message volume.',
}

export const PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS =
    PERFORMANCE_OVERVIEW_BREAKDOWN_METRIC_COLUMNS
