import React, { UIEventHandler, useState } from 'react'

import classNames from 'classnames'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useAgentsSortingQuery } from 'hooks/reporting/useAgentsSortingQuery'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useMeasure from 'hooks/useMeasure'
import { StatsFilters } from 'models/stat/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import { AgentsHeaderCellContent } from 'pages/stats/support-performance/agents/AgentsHeaderCellContent'
import { getTableCell } from 'pages/stats/support-performance/agents/AgentsTable'
import {
    useAnsweredCallsMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
} from 'pages/stats/voice/hooks/agentMetrics'
import { STATS_ROUTES } from 'routes/constants'
import { VoiceAgentsTableColumn } from 'state/ui/stats/types'
import {
    getPaginatedAgents,
    isSortingMetricLoading,
    pageSet,
    voiceAgentsPerformance,
} from 'state/ui/stats/voiceAgentsPerformanceSlice'

import TeamAverageCallsCountCell from './TeamAverageCallsCountCell'
import TeamAverageTalkTimeCell from './TeamAverageTalkTimeCell'
import { columns, getQuery } from './VoiceAgentsTableConfig'

import css from './VoiceAgentsTable.less'

const getSortingQuery = (
    column: VoiceAgentsTableColumn,
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    },
) => {
    const query = getQuery(column)

    return () =>
        useAgentsSortingQuery<VoiceAgentsTableColumn>(
            column,
            query,
            statsFilters,
            voiceAgentsPerformance,
        )
}

export const VoiceAgentsTable = () => {
    const {
        currentPage,
        perPage,
        agents: paginatedAgents,
        allAgents: agents,
    } = useAppSelector(getPaginatedAgents)
    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const statsFilters = useStatsFilters()
    const isSortingLoading = useAppSelector(isSortingMetricLoading)
    const dispatch = useAppDispatch()

    const handlePageChange = (page: number) => {
        dispatch(pageSet(page))
    }

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    const totalPages = Math.ceil(agents.length / perPage)

    if (currentPage > totalPages) {
        handlePageChange(totalPages)
    }

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{ width }}>
                    <TableHead
                        className={classNames(css.tableHead, css.tableRow)}
                    >
                        {columns.map((column, index) => (
                            <AgentsHeaderCellContent
                                key={`header-cell-${column.title}`}
                                title={column.title}
                                hint={
                                    column.tooltip
                                        ? { title: column.tooltip }
                                        : null
                                }
                                justifyContent={index === 0 ? 'left' : 'right'}
                                className={classNames(css.metricCell, {
                                    [css.agentsCell]:
                                        column.id ===
                                        VoiceAgentsTableColumn.AgentName,
                                    [css.withShadow]:
                                        index === 0 && isTableScrolled,
                                })}
                                useSortingQuery={getSortingQuery(
                                    column.id,
                                    statsFilters,
                                )}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        <TableBodyRow
                            className={classNames(css.tableRow, css.summaryRow)}
                        >
                            <BodyCell
                                className={classNames(css.agentsCell, {
                                    [css.withShadow]: isTableScrolled,
                                })}
                            >
                                Average
                            </BodyCell>
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useTotalCallsMetric}
                            />
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useAnsweredCallsMetric}
                            />
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useMissedCallsMetric}
                            />
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useDeclinedCallsMetric}
                            />
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useOutboundCallsMetric}
                            />
                            <TeamAverageTalkTimeCell />
                        </TableBodyRow>
                        {paginatedAgents.map((agent) => (
                            <TableBodyRow
                                key={agent.id}
                                className={css.tableRow}
                            >
                                {columns.map((column, index) => (
                                    <React.Fragment key={column.id}>
                                        {React.createElement(
                                            getTableCell(column.id),
                                            {
                                                agent,
                                                useMetricPerAgentQueryHook:
                                                    getQuery(column.id),
                                                statsFilters,
                                                metricFormat:
                                                    column.metricFormat ??
                                                    'decimal',
                                                drillDownMetricData:
                                                    column.metricName
                                                        ? {
                                                              title: `${column.title} | ${agent.name}`,
                                                              metricName:
                                                                  column.metricName,
                                                              perAgentId:
                                                                  agent.id,
                                                          }
                                                        : null,
                                                isSortingMetricLoading:
                                                    isSortingLoading,
                                                bodyCellProps: {
                                                    className:
                                                        index === 0 &&
                                                        isTableScrolled
                                                            ? css.withShadow
                                                            : '',
                                                    justifyContent:
                                                        index === 0
                                                            ? 'left'
                                                            : 'right',
                                                },
                                                isHeatmapMode: false,
                                                redirectTo: `${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_OVERVIEW}`,
                                            },
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div className={css.pagination}>
                {agents.length >= perPage && (
                    <NumberedPagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                    />
                )}
            </div>
        </>
    )
}
