import React, { FunctionComponent, UIEventHandler, useState } from 'react'

import classNames from 'classnames'

import { User } from 'config/types/user'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useAgentsSortingQuery } from 'hooks/reporting/useAgentsSortingQuery'
import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useMeasure from 'hooks/useMeasure'
import { StatsFilters } from 'models/stat/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/common/components/Table/AnalyticsTable.less'
import { AgentNameCellContent } from 'pages/stats/support-performance/agents/AgentNameCellContent'
import {
    AgentsCellContent,
    AgentsCellContentProps,
} from 'pages/stats/support-performance/agents/AgentsCellContent'
import { AgentsHeaderCellContent } from 'pages/stats/support-performance/agents/AgentsHeaderCellContent'
import { AgentsSummaryRow } from 'pages/stats/support-performance/agents/AgentsSummaryRow'
import {
    AgentsColumnConfig,
    getColumnAlignment,
    getColumnWidth,
    getDrillDownMetricData,
    getQuery,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    getHeatmapMode,
    getPaginatedAgents,
    isSortingMetricLoading,
    pageSet,
} from 'state/ui/stats/agentPerformanceSlice'
import { AgentsTableColumn } from 'state/ui/stats/types'

export const getTableCell = (
    column: AgentsTableColumn,
): FunctionComponent<AgentsCellContentProps> => {
    if (column === AgentsTableColumn.AgentName) {
        return AgentNameCellContent
    }
    return AgentsCellContent
}

const getSortingQuery = (
    column: AgentsTableColumn,
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    },
) => {
    const query = getQuery(column)

    return () => useAgentsSortingQuery(column, query, statsFilters)
}

type AgentsTableProps = {
    paginatedAgents: {
        currentPage: number
        perPage: number
        agents: User[]
        allAgents: User[]
    }
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    }
    withAggregateRows?: boolean
    isHeatmapMode?: boolean
}

export const AgentsTable = ({
    paginatedAgents,
    statsFilters,
    withAggregateRows = true,
    isHeatmapMode = false,
}: AgentsTableProps) => {
    const dispatch = useAppDispatch()
    const { columnsOrder, rowsOrder } = useAgentsTableConfigSetting()
    const { currentPage, perPage, agents, allAgents } = paginatedAgents
    const onPageChangeCallback = (page: number) => {
        dispatch(pageSet(page))
    }

    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }
    const isSortingLoading = useAppSelector(isSortingMetricLoading)
    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{ width }}>
                    <TableHead>
                        {columnsOrder.map((column, index) => (
                            <AgentsHeaderCellContent
                                key={`header-cell-${column}`}
                                title={TableLabels[column]}
                                hint={AgentsColumnConfig[column].hint}
                                useSortingQuery={getSortingQuery(
                                    column,
                                    statsFilters,
                                )}
                                width={getColumnWidth(column)} //TODO: consider introducing common props per cell type (header, average, body)
                                justifyContent={getColumnAlignment(column)}
                                className={classNames(css.BodyCell, {
                                    [css.withShadow]:
                                        index === 0 && isTableScrolled,
                                })}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {withAggregateRows &&
                            rowsOrder.map((row, index) => (
                                <AgentsSummaryRow
                                    isTableScrolled={isTableScrolled}
                                    isEmphasized={index === 0}
                                    statsFilters={statsFilters}
                                    agents={allAgents}
                                    columns={columnsOrder}
                                    type={row}
                                    key={row}
                                />
                            ))}
                        {agents.map((agent) => (
                            <TableBodyRow key={agent.id}>
                                {columnsOrder.map((column) => (
                                    <React.Fragment key={column}>
                                        {React.createElement(
                                            getTableCell(column),
                                            {
                                                agent,
                                                useMetricPerAgentQueryHook:
                                                    getQuery(column),
                                                statsFilters,
                                                metricFormat:
                                                    AgentsColumnConfig[column]
                                                        .format,
                                                drillDownMetricData:
                                                    getDrillDownMetricData(
                                                        column,
                                                        agent,
                                                    ),
                                                isHeatmapMode: isHeatmapMode,
                                                isSortingMetricLoading:
                                                    isSortingLoading,
                                                bodyCellProps: {
                                                    width: getColumnWidth(
                                                        column,
                                                    ),
                                                    justifyContent:
                                                        getColumnAlignment(
                                                            column,
                                                        ),
                                                    className: classNames(
                                                        css.BodyCell,
                                                        {
                                                            [css.withShadow]:
                                                                column ===
                                                                    AgentsTableColumn.AgentName &&
                                                                isTableScrolled,
                                                        },
                                                    ),
                                                    innerClassName:
                                                        css.BodyCellContent,
                                                },
                                            },
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {allAgents.length > perPage && (
                    <NumberedPagination
                        count={Math.ceil(allAgents.length / perPage)}
                        page={currentPage}
                        onChange={onPageChangeCallback}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}

export const AgentsTableWithDefaultState = () => {
    const paginatedAgents = useAppSelector(getPaginatedAgents)
    const statsFilters = useStatsFilters()
    const isHeatmapMode = useAppSelector(getHeatmapMode)

    return (
        <AgentsTable
            paginatedAgents={paginatedAgents}
            statsFilters={statsFilters}
            isHeatmapMode={isHeatmapMode}
        />
    )
}
