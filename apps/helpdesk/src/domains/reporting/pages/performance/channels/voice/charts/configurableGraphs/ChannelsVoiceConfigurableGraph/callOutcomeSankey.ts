import type { SankeyChartData } from '@repo/reporting'

export const CALL_OUTCOME_MEASURES = [
    'inboundCallsCount',
    'outboundCallsCount',
    'inboundAnsweredCallsCount',
    'inboundUnansweredCallsCount',
    'inboundMissedCallsCount',
    'inboundAbandonedCallsCount',
    'inboundCancelledCallsCount',
    'inboundCallbackRequestedCallsCount',
] as const

export type CallOutcomeMeasure = (typeof CALL_OUTCOME_MEASURES)[number]

// Human-readable label for each measure, used as the "metric" column when
// exporting the call-outcome funnel to CSV.
export const CALL_OUTCOME_MEASURE_LABELS: Record<CallOutcomeMeasure, string> = {
    inboundCallsCount: 'Inbound',
    outboundCallsCount: 'Outbound',
    inboundAnsweredCallsCount: 'Answered',
    inboundUnansweredCallsCount: 'Unanswered',
    inboundMissedCallsCount: 'Missed',
    inboundAbandonedCallsCount: 'Abandoned',
    inboundCancelledCallsCount: 'Canceled',
    inboundCallbackRequestedCallsCount: 'Callback requested',
}

export type CallOutcomeRow = Record<CallOutcomeMeasure, string | null>

export const parseCallOutcomeValues = (
    row: CallOutcomeRow | undefined,
): Record<CallOutcomeMeasure, number> =>
    CALL_OUTCOME_MEASURES.reduce(
        (acc, measure) => {
            const value = row?.[measure]
            acc[measure] = value != null ? parseFloat(value) : 0
            return acc
        },
        {} as Record<CallOutcomeMeasure, number>,
    )

export const CALL_OUTCOME_NODE = {
    TotalCalls: 'Total calls',
    Inbound: 'Inbound',
    Outbound: 'Outbound',
    Answered: 'Answered',
    Unanswered: 'Unanswered',
    Missed: 'Missed',
    Abandoned: 'Abandoned',
    Canceled: 'Canceled',
    CallbackRequested: 'Callback',
} as const

const DARK_PURPLE = '#7E55F6'
const PURPLE = '#9B7BFF'
const GREEN = '#32C898'
const CORAL = '#FF9780'
const RED = '#FF425D'

// Nodes declared top-to-bottom; recharts groups them into columns by depth, so
// within each column they stack in this order (e.g. inbound above outbound).
const CALL_OUTCOME_NODES: { name: string; color: string }[] = [
    { name: CALL_OUTCOME_NODE.TotalCalls, color: DARK_PURPLE },
    { name: CALL_OUTCOME_NODE.Inbound, color: PURPLE },
    { name: CALL_OUTCOME_NODE.Unanswered, color: CORAL },
    { name: CALL_OUTCOME_NODE.Missed, color: RED },
    { name: CALL_OUTCOME_NODE.Canceled, color: CORAL },
    { name: CALL_OUTCOME_NODE.Abandoned, color: CORAL },
    { name: CALL_OUTCOME_NODE.CallbackRequested, color: CORAL },
    { name: CALL_OUTCOME_NODE.Answered, color: GREEN },
    { name: CALL_OUTCOME_NODE.Outbound, color: PURPLE },
]

const NODE_COLOR = new Map(
    CALL_OUTCOME_NODES.map((node) => [node.name, node.color]),
)

// The funnel as a flat edge list: each flow's value comes from one measure.
const CALL_OUTCOME_EDGES: {
    source: string
    target: string
    measure: CallOutcomeMeasure
}[] = [
    {
        source: CALL_OUTCOME_NODE.TotalCalls,
        target: CALL_OUTCOME_NODE.Inbound,
        measure: 'inboundCallsCount',
    },
    {
        source: CALL_OUTCOME_NODE.Inbound,
        target: CALL_OUTCOME_NODE.Unanswered,
        measure: 'inboundUnansweredCallsCount',
    },
    {
        source: CALL_OUTCOME_NODE.Unanswered,
        target: CALL_OUTCOME_NODE.Missed,
        measure: 'inboundMissedCallsCount',
    },
    {
        source: CALL_OUTCOME_NODE.Unanswered,
        target: CALL_OUTCOME_NODE.Canceled,
        measure: 'inboundCancelledCallsCount',
    },
    {
        source: CALL_OUTCOME_NODE.Unanswered,
        target: CALL_OUTCOME_NODE.Abandoned,
        measure: 'inboundAbandonedCallsCount',
    },
    {
        source: CALL_OUTCOME_NODE.Unanswered,
        target: CALL_OUTCOME_NODE.CallbackRequested,
        measure: 'inboundCallbackRequestedCallsCount',
    },
    {
        source: CALL_OUTCOME_NODE.Inbound,
        target: CALL_OUTCOME_NODE.Answered,
        measure: 'inboundAnsweredCallsCount',
    },
    {
        source: CALL_OUTCOME_NODE.TotalCalls,
        target: CALL_OUTCOME_NODE.Outbound,
        measure: 'outboundCallsCount',
    },
]

/**
 * Builds the call-outcome funnel: total calls split into inbound/outbound,
 * inbound into answered/unanswered, and unanswered into its termination reasons.
 * Empty flows (and any node left unconnected) are dropped so the chart stays
 * clean when a branch has no data. Each link is colored by its target so the
 * flow reads as its destination outcome.
 */
export const buildCallOutcomeSankeyData = (
    values: Record<CallOutcomeMeasure, number>,
): SankeyChartData => {
    const links = CALL_OUTCOME_EDGES.filter(
        ({ measure }) => values[measure] > 0,
    ).map(({ source, target, measure }) => ({
        source,
        target,
        value: values[measure],
        color: NODE_COLOR.get(target),
    }))

    const linkedNames = new Set(
        links.flatMap((link) => [link.source, link.target]),
    )
    const nodes = CALL_OUTCOME_NODES.filter((node) =>
        linkedNames.has(node.name),
    )

    return { nodes, links }
}
