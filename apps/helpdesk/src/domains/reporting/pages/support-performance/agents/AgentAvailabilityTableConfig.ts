import type { MetricValueFormat, TooltipData } from '@repo/reporting'

import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-types'

import {
    AGENT_NAME_COLUMN_WIDTH,
    METRIC_COLUMN_WIDTH,
    MOBILE_AGENT_NAME_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    AGENT_AVAILABILITY_COLUMNS,
    FIXED_AGENT_AVAILABILITY_COLUMN_CONFIG,
    ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS,
} from 'domains/reporting/pages/support-performance/agents/constants'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'

export type OnlineTimeColumnKey = 'agent_online_time'
export type AgentNameColumnKey = 'agent_name'
const { AGENT_NAME_COLUMN } = AGENT_AVAILABILITY_COLUMNS

// hard-coded on the BE as such
type SystemStatusName = 'available' | 'unavailable' | 'on-call' | 'wrapping-up'

type StatusColumnKey = `agent_status_${SystemStatusName | string}`

export type AgentAvailabilityColumn =
    | AgentNameColumnKey
    | OnlineTimeColumnKey
    | StatusColumnKey

export const getCustomUnavailabilityStatusColumnKey = (
    statusId: SystemStatusName | string,
): StatusColumnKey => `agent_status_${statusId}`

// Generate column order from statuses
export const getAvailabilityTableColumnsOrder = (
    statuses: CustomUserAvailabilityStatus[] | undefined,
): AgentAvailabilityColumn[] => {
    if (!statuses) return ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS

    const statusColumns = statuses.map((status) =>
        getCustomUnavailabilityStatusColumnKey(status.id),
    )
    return [...ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS, ...statusColumns]
}

// Column configuration type
export type AvailabilityColumnConfig = {
    format: MetricValueFormat | 'agent_name'
    hint: TooltipData | null
    label: string
}

export type AvailabilityColumnDictionary = Record<
    AgentAvailabilityColumn,
    AvailabilityColumnConfig
>

// Generate column config from statuses
export const getColumnConfig = (
    customAvailabilityStatuses: CustomUserAvailabilityStatus[] | undefined,
): Record<string, AvailabilityColumnConfig> => {
    const mappedCustomAvailabilityStatuses = customAvailabilityStatuses?.reduce(
        (acc, status) => ({
            ...acc,
            [getCustomUnavailabilityStatusColumnKey(status.id)]: {
                format: 'duration',
                label: status.name,
                hint: status.description
                    ? {
                          title: status.description,
                          link: '',
                      }
                    : null,
            },
        }),
        {},
    )

    return {
        ...FIXED_AGENT_AVAILABILITY_COLUMN_CONFIG,
        ...mappedCustomAvailabilityStatuses,
    }
}

export const getColumnWidth = (column: AgentAvailabilityColumn) => {
    if (isMediumOrSmallScreen()) {
        return column === AGENT_NAME_COLUMN
            ? MOBILE_AGENT_NAME_COLUMN_WIDTH
            : MOBILE_METRIC_COLUMN_WIDTH
    }
    return column === AGENT_NAME_COLUMN
        ? AGENT_NAME_COLUMN_WIDTH
        : METRIC_COLUMN_WIDTH
}

export const getColumnAlignment = (column: AgentAvailabilityColumn) =>
    column === AGENT_NAME_COLUMN ? 'left' : 'right'
