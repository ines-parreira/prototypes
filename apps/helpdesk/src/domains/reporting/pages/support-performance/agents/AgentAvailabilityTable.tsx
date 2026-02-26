import type { UIEventHandler } from 'react'
import { useMemo, useState } from 'react'

import { useMeasure } from '@repo/hooks'
import classNames from 'classnames'

import { Box, Skeleton, Text } from '@gorgias/axiom'

import type { User } from 'config/types/user'
import { useOnlineTimePerAgentAvailability } from 'domains/reporting/hooks/availability/useAvailabilityMetrics'
import { useAgentAvailabilitySortingQuery } from 'domains/reporting/hooks/useAgentAvailabilitySortingQuery'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import { AgentAvailabilityRow } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityRow'
import { AgentAvailabilitySummaryRow } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilitySummaryRow'
import { getColumnValue } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableCell'
import type { AgentAvailabilityColumn } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import {
    getAvailabilityTableColumnsOrder,
    getColumnAlignment,
    getColumnConfig,
    getColumnWidth,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AgentsHeaderCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsHeaderCellContent'
import { TableRowsOrderWithTotal } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { useAgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData'
import type { StatusBreakdown } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'
import {
    getAgentSorting,
    getAgentsPagination,
    pageSet,
    sortingSet,
} from 'domains/reporting/state/ui/stats/agentAvailabilitySlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

/**
 * Agent availability data with system and custom status columns
 *
 * System columns (always present, keys match API status names):
 * - agent_online_time: Total online time
 * - agent_status_available: Time in "available" status
 * - agent_status_unavailable: Time in "unavailable" status
 * - agent_status_on-call: Time in "on-call" status
 * - agent_status_wrapping-up: Time in "wrapping-up" status
 *
 * Custom columns (dynamic):
 * - agent_status_<custom-id>: Time in custom statuses (e.g., "agent_status_019ba44b-...")
 */

type AgentAvailabilityTableProps = {
    allAgents: User[]
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    }
}

export const AgentAvailabilityTable = ({
    allAgents,
    statsFilters,
}: AgentAvailabilityTableProps) => {
    const { cleanStatsFilters, userTimezone } = statsFilters
    const dispatch = useAppDispatch()
    const [ref, { width: __width }] = useMeasure<HTMLDivElement>()

    const {
        agents: transformedAgents,
        customStatuses,
        isLoading,
        isError,
    } = useAgentAvailabilityData(allAgents, cleanStatsFilters, userTimezone)

    const columnsOrder = useMemo(
        () => getAvailabilityTableColumnsOrder(customStatuses),
        [customStatuses],
    )
    const columnConfig = useMemo(
        () => getColumnConfig(customStatuses),
        [customStatuses],
    )

    const sorting = useAppSelector(getAgentSorting)

    // For "Online" column: use server-side sorted data if available
    // For all status columns: use client-side sorting
    const agents = useMemo(() => {
        if (!sorting?.field || !transformedAgents.length) {
            return transformedAgents
        }

        // Server-side sorting for "Online" column
        if (
            sorting.field === 'agent_online_time' &&
            sorting.lastSortingMetric
        ) {
            const sortedIds = sorting.lastSortingMetric.map((item) =>
                Number(item.agentId),
            )

            return [...transformedAgents].sort((a, b) => {
                const aIndex = sortedIds.indexOf(a.id)
                const bIndex = sortedIds.indexOf(b.id)
                if (aIndex === -1) return 1
                if (bIndex === -1) return -1
                return aIndex - bIndex
            })
        }

        // Client-side sorting for all status columns (fixed + custom)
        // Status columns contain { total, online, offline } - sort by total
        return [...transformedAgents].sort((a, b) => {
            const aField = a[sorting.field] as
                | number
                | StatusBreakdown
                | undefined
            const bField = b[sorting.field] as
                | number
                | StatusBreakdown
                | undefined

            // Extract numeric value (handles both number and StatusBreakdown)
            const aValue = getColumnValue(aField) ?? 0
            const bValue = getColumnValue(bField) ?? 0

            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            return sorting.direction === OrderDirection.Desc
                ? -comparison
                : comparison
        })
    }, [transformedAgents, sorting])

    // Create sorting query function for header cells
    const getSortingQuery = (column: AgentAvailabilityColumn) => {
        // Server-side sorting for "Online" column
        if (column === 'agent_online_time') {
            return () =>
                useAgentAvailabilitySortingQuery(
                    column,
                    useOnlineTimePerAgentAvailability,
                    statsFilters,
                )
        }

        // Client-side sorting for all status columns (fixed + custom)
        return () => ({
            sortCallback: () => {
                dispatch(
                    sortingSet({
                        field: column,
                        direction:
                            sorting.field === column
                                ? sorting.direction === OrderDirection.Asc
                                    ? OrderDirection.Desc
                                    : OrderDirection.Asc
                                : OrderDirection.Desc,
                    }),
                )
            },
            direction: sorting.direction,
            field: sorting.field,
            isOrderedBy: column === sorting.field,
        })
    }

    const { currentPage, perPage } = useAppSelector(getAgentsPagination)
    const paginatedAgents = useMemo(() => {
        const startIndex = (currentPage - 1) * perPage
        return agents.slice(startIndex, startIndex + perPage)
    }, [agents, currentPage, perPage])

    const totalPages = Math.ceil(agents.length / perPage)
    const shouldShowPagination = totalPages > 1

    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    if (isLoading) {
        return <Skeleton height={400} />
    }

    if (isError) {
        return (
            <Box padding="md">
                <Text color="error">
                    Error loading availability data. Please try again.
                </Text>
            </Box>
        )
    }

    if (!agents.length) {
        return (
            <Box padding="md">
                <Text>
                    No availability data available for the selected period.
                </Text>
            </Box>
        )
    }

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table}>
                    <TableHead>
                        {columnsOrder.map((column, index) => (
                            <AgentsHeaderCellContent
                                key={`header-cell-${column}`}
                                title={columnConfig[column]?.label || ''}
                                hint={columnConfig[column]?.hint || null}
                                useSortingQuery={getSortingQuery(column)}
                                width={getColumnWidth(column)}
                                justifyContent={getColumnAlignment(column)}
                                className={classNames(css.BodyCell, {
                                    [css.withShadow]:
                                        index === 0 && isTableScrolled,
                                })}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {TableRowsOrderWithTotal.map((row, index) => (
                            <AgentAvailabilitySummaryRow
                                key={row}
                                row={row}
                                agents={agents}
                                columnsOrder={columnsOrder}
                                isTableScrolled={isTableScrolled}
                                isEmphasized={index === 0}
                            />
                        ))}
                        {paginatedAgents.map((agent) => (
                            <AgentAvailabilityRow
                                key={agent.id}
                                agent={agent}
                                columnsOrder={columnsOrder}
                                isTableScrolled={isTableScrolled}
                            />
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {shouldShowPagination && (
                    <NumberedPagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(page: number) => dispatch(pageSet(page))}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}
