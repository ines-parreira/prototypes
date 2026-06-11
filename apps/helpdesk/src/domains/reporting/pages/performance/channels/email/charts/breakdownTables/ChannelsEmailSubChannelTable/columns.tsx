import type { NameColumnConfig } from '@repo/reporting'

import { CHANNELS_EMAIL_BREAKDOWN_METRIC_COLUMNS } from 'domains/reporting/pages/performance/channels/email/config/breakdownTableMetrics'
import { humanizeChannel } from 'state/ticket/utils'

export const CHANNELS_EMAIL_SUB_CHANNEL_NAME_COLUMNS: NameColumnConfig[] = [
    { accessor: 'entity', label: 'Sub-channel', formatName: humanizeChannel },
]

export const CHANNELS_EMAIL_SUB_CHANNEL_TABLE = {
    title: 'Sub-channel',
    description:
        'Email performance metrics per sub-channel: resolution time, first response time, messages per ticket, average CSAT, ticket volume, and message volume.',
}

export const CHANNELS_EMAIL_SUB_CHANNEL_COLUMNS =
    CHANNELS_EMAIL_BREAKDOWN_METRIC_COLUMNS
