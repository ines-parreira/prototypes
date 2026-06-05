import type {
    AnyStatAxisValue,
    Stat,
    StatCell,
    StatData,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { StatType } from 'domains/reporting/models/stat/types'

import type {
    LiveAgentMetricAxis,
    LiveAgentMetricCell,
} from 'domains/reporting/pages/live/agents/dataTable/types'

export type ParsedUserPerformance = {
    metricAxes: LiveAgentMetricAxis[]
    byUserId: Map<number, Partial<Record<string, LiveAgentMetricCell>>>
}

const EMPTY_PARSED: ParsedUserPerformance = {
    metricAxes: [],
    byUserId: new Map(),
}

function isTwoDimensionalChart(data: StatData): data is TwoDimensionalChart {
    return (
        typeof data.data === 'object' &&
        data.data !== null &&
        'axes' in data.data &&
        'lines' in data.data
    )
}

function getAxisDefinition(axis: AnyStatAxisValue): LiveAgentMetricAxis | null {
    if (typeof axis === 'object' && 'name' in axis && 'type' in axis) {
        return { name: axis.name, type: axis.type }
    }
    return null
}

function getCellValue(cell: StatCell | undefined): unknown {
    if (cell && 'value' in cell) {
        return cell.value
    }
    return undefined
}

function toScalar(value: unknown): number | string | boolean | null {
    if (
        typeof value === 'number' ||
        typeof value === 'string' ||
        typeof value === 'boolean'
    ) {
        return value
    }
    return null
}

function toChannelBreakdown(value: unknown): Partial<Record<string, number>> {
    if (!value || typeof value !== 'object') {
        return {}
    }
    const breakdown: Record<string, number> = {}
    Object.entries(value).forEach(([channel, count]) => {
        if (typeof count === 'number') {
            breakdown[channel] = count
        }
    })
    return breakdown
}

function getUserId(cell: StatCell | undefined): number | undefined {
    const value = getCellValue(cell)
    if (
        value &&
        typeof value === 'object' &&
        'id' in value &&
        typeof value.id === 'number' &&
        value.id > 0
    ) {
        return value.id
    }
    return undefined
}

/**
 * Reshapes the `users-performance-overview` stat into plain objects keyed by
 * user id, so the DataTable can join metrics onto user-driven rows in O(1).
 *
 * Mirrors the legacy `formatUserPerformanceData` reshaping: the `Online time`
 * column becomes an online/offline state badge, `Open tickets` carries its
 * per-channel breakdown, and the helper columns folded into those two (timezone,
 * sessions, the raw `Online` boolean, the per-channel object) are dropped.
 */
export function parseUserPerformanceStat(
    stat: Stat<StatData> | null | undefined,
): ParsedUserPerformance {
    if (!stat || !isTwoDimensionalChart(stat.data)) {
        return EMPTY_PARSED
    }

    const { axes, lines } = stat.data.data
    const axisDefinitions = axes.x.map(getAxisDefinition)

    const indexByName = (name: string) =>
        axisDefinitions.findIndex((axis) => axis?.name === name)

    const userIndex = axisDefinitions.findIndex(
        (axis) => axis?.type === StatType.User,
    )
    const openTicketsIndex = indexByName('Open tickets')
    const ticketsBreakdownIndex = indexByName('Open tickets per channel')
    const onlineTimeIndex = indexByName('Online time')
    const agentTimezoneIndex = indexByName('Agent timezone')
    const onlineIndex = indexByName('Online')
    const firstSessionIndex = indexByName('First Session')
    const lastSessionIndex = indexByName('Last Session')

    // Online status is rendered as its own realtime-backed column, so the
    // online-time / online / timezone / session columns are dropped here.
    const hiddenIndices = new Set(
        [
            userIndex,
            ticketsBreakdownIndex,
            onlineTimeIndex,
            lastSessionIndex,
            firstSessionIndex,
            onlineIndex,
            agentTimezoneIndex,
        ].filter((index) => index >= 0),
    )

    const metricAxes = axisDefinitions.reduce<LiveAgentMetricAxis[]>(
        (acc, axis, index) => {
            if (!axis || hiddenIndices.has(index)) {
                return acc
            }
            if (index === openTicketsIndex) {
                acc.push({ name: axis.name, type: StatType.TicketDetails })
            } else {
                acc.push(axis)
            }
            return acc
        },
        [],
    )

    const byUserId = new Map<
        number,
        Partial<Record<string, LiveAgentMetricCell>>
    >()

    lines.forEach((line) => {
        if (!Array.isArray(line)) {
            return
        }
        const userId = getUserId(line[userIndex])
        if (!userId) {
            return
        }

        const metrics: Partial<Record<string, LiveAgentMetricCell>> = {}

        axisDefinitions.forEach((axis, index) => {
            if (!axis || hiddenIndices.has(index)) {
                return
            }
            if (index === openTicketsIndex) {
                metrics[axis.name] = {
                    type: StatType.TicketDetails,
                    value: Number(toScalar(getCellValue(line[index])) ?? 0),
                    details: toChannelBreakdown(
                        getCellValue(line[ticketsBreakdownIndex]),
                    ),
                }
            } else {
                metrics[axis.name] = {
                    type: axis.type,
                    value: toScalar(getCellValue(line[index])),
                }
            }
        })

        byUserId.set(userId, metrics)
    })

    return { metricAxes, byUserId }
}
