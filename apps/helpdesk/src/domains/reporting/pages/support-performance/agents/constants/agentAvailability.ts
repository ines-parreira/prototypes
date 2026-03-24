import type {
    AgentAvailabilityColumn,
    AvailabilityColumnDictionary,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'

export const AGENT_AVAILABILITY_COLUMNS = {
    AGENT_NAME_COLUMN: 'agent_name',
    ONLINE_TIME_COLUMN: 'agent_online_time',
    AVAILABLE_STATUS_COLUMN: 'agent_status_available',
    UNAVAILABLE_STATUS_COLUMN: 'agent_status_unavailable',
    ON_CALL_STATUS_COLUMN: 'agent_status_on-call',
    WRAPPING_UP_STATUS_COLUMN: 'agent_status_wrapping-up',
} as const

export const ORDERED_FIXED_AGENT_AVAILABILITY_COLUMNS = Object.values(
    AGENT_AVAILABILITY_COLUMNS,
) satisfies AgentAvailabilityColumn[]

const {
    AGENT_NAME_COLUMN,
    ONLINE_TIME_COLUMN,
    AVAILABLE_STATUS_COLUMN,
    UNAVAILABLE_STATUS_COLUMN,
    ON_CALL_STATUS_COLUMN,
    WRAPPING_UP_STATUS_COLUMN,
} = AGENT_AVAILABILITY_COLUMNS

export const AGENT_AVAILABILITY_TABLE_LABELS: Record<
    AgentAvailabilityColumn,
    string
> = {
    [AGENT_NAME_COLUMN]: 'Agent',
    [ONLINE_TIME_COLUMN]: 'Online',
    [AVAILABLE_STATUS_COLUMN]: 'Available',
    [UNAVAILABLE_STATUS_COLUMN]: 'Unavailable',
    [ON_CALL_STATUS_COLUMN]: 'On a call',
    [WRAPPING_UP_STATUS_COLUMN]: 'Call wrap-up',
}

export const FIXED_AGENT_AVAILABILITY_COLUMN_CONFIG: AvailabilityColumnDictionary =
    {
        [AGENT_NAME_COLUMN]: {
            hint: null,
            format: 'agent_name',
            label: AGENT_AVAILABILITY_TABLE_LABELS[AGENT_NAME_COLUMN],
        },
        [ONLINE_TIME_COLUMN]: {
            format: 'duration',
            hint: {
                title: 'Total time the agent had at least one Gorgias tab open during the period. This is the sum of Available and Unavailable time. Only affected by the date and agent filter.',
            },
            label: AGENT_AVAILABILITY_TABLE_LABELS[ONLINE_TIME_COLUMN],
        },
        [AVAILABLE_STATUS_COLUMN]: {
            format: 'duration',
            hint: {
                title: 'Total time the agent was online and set to available during the period. Only affected by the date and agent filter.',
            },
            label: AGENT_AVAILABILITY_TABLE_LABELS[AVAILABLE_STATUS_COLUMN],
        },
        [UNAVAILABLE_STATUS_COLUMN]: {
            format: 'duration',
            hint: {
                title: 'Total time the agent was online but set to unavailable during the period. Only affected by the date and agent filter.',
            },
            label: AGENT_AVAILABILITY_TABLE_LABELS[UNAVAILABLE_STATUS_COLUMN],
        },
        [ON_CALL_STATUS_COLUMN]: {
            format: 'duration',
            hint: {
                title: 'Total time the agent spent on phone calls during the period. Only affected by the date and agent filter.',
            },
            label: AGENT_AVAILABILITY_TABLE_LABELS[ON_CALL_STATUS_COLUMN],
        },
        [WRAPPING_UP_STATUS_COLUMN]: {
            format: 'duration',
            hint: {
                title: 'Total time the agent spent in wrap-up after calls ended during the period. Only affected by the date and agent filter.',
            },
            label: AGENT_AVAILABILITY_TABLE_LABELS[WRAPPING_UP_STATUS_COLUMN],
        },
    }
