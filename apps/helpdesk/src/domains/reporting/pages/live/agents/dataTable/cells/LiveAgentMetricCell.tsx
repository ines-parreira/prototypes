import { formatDuration } from '@repo/reporting'

import { DataTableBaseCell, Text } from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'

import { StatType } from 'domains/reporting/models/stat/types'
import { OpenTicketsCell } from 'domains/reporting/pages/live/agents/dataTable/cells/OpenTicketsCell'
import {
    useLiveAgentMetrics,
    useLiveAgentMetricsLoading,
} from 'domains/reporting/pages/live/agents/dataTable/LiveAgentMetricsContext'
import type { LiveAgentRow } from 'domains/reporting/pages/live/agents/dataTable/types'

const EMPTY_VALUE = '—'

type Props = {
    axisName: string
    cell: CellContext<LiveAgentRow, unknown>
}

const ZERO_VALUE = '0'

export function LiveAgentMetricCell({ axisName, cell }: Props) {
    const isLoading = useLiveAgentMetricsLoading()
    const metric = useLiveAgentMetrics(cell.row.original.userId)[axisName]

    // The agent list (and the online/availability columns) load before the
    // stats, so the table renders while only the metric cells show a per-cell
    // skeleton until the stats request resolves.
    if (isLoading) {
        return <DataTableBaseCell {...cell} isLoading />
    }

    // An agent missing from the stats response means no activity today, which
    // we surface as 0 rather than a "no data" dash — these columns are all
    // numeric counters, and a real 0 already renders as 0.
    if (!metric) {
        return (
            <DataTableBaseCell {...cell}>
                <Text>{ZERO_VALUE}</Text>
            </DataTableBaseCell>
        )
    }

    switch (metric.type) {
        case StatType.TicketDetails: {
            const openTickets =
                typeof metric.value === 'number' ? metric.value : 0
            if (openTickets === 0) {
                return (
                    <DataTableBaseCell {...cell}>
                        <Text>{ZERO_VALUE}</Text>
                    </DataTableBaseCell>
                )
            }
            return (
                <OpenTicketsCell
                    cell={cell}
                    openTickets={openTickets}
                    channelsBreakdown={metric.details ?? {}}
                />
            )
        }
        case StatType.Duration:
            return (
                <DataTableBaseCell {...cell}>
                    <Text>
                        {typeof metric.value === 'number'
                            ? formatDuration(metric.value)
                            : EMPTY_VALUE}
                    </Text>
                </DataTableBaseCell>
            )
        case StatType.Percent:
            return (
                <DataTableBaseCell {...cell}>
                    <Text>
                        {metric.value == null
                            ? EMPTY_VALUE
                            : `${String(metric.value)}%`}
                    </Text>
                </DataTableBaseCell>
            )
        default:
            return (
                <DataTableBaseCell {...cell}>
                    <Text>
                        {metric.value == null
                            ? ZERO_VALUE
                            : String(metric.value)}
                    </Text>
                </DataTableBaseCell>
            )
    }
}
