import React, { FunctionComponent, UIEventHandler, useState } from 'react'

import classNames from 'classnames'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useAutoQAAgentsSortingQuery } from 'domains/reporting/hooks/useAutoQAAgentsSortingQuery'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import { AgentNameCellContent } from 'domains/reporting/pages/support-performance/agents/AgentNameCellContent'
import {
    AgentsCellContent,
    AgentsCellContentProps,
} from 'domains/reporting/pages/support-performance/agents/AgentsCellContent'
import { AgentsHeaderCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsHeaderCellContent'
import {
    AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER,
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
    getColumnAlignment,
    getColumnWidth,
    getDrillDownMetricData,
    getQuery,
    TableLabels,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {
    getHeatmapMode,
    getPaginatedAutoQAAgents,
    isSortingMetricLoading,
    pageSet,
} from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useMeasure from 'hooks/useMeasure'
import { NumberedPagination } from 'pages/common/components/Paginations'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

export const getTableCell = (
    column: AutoQAAgentsTableColumn,
): FunctionComponent<AgentsCellContentProps> => {
    if (column === AutoQAAgentsTableColumn.AgentName) {
        return AgentNameCellContent
    }
    return AgentsCellContent
}

const getSortingQuery = (
    column: AutoQAAgentsTableColumn,
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    },
) => {
    const query = getQuery(column)

    return () => useAutoQAAgentsSortingQuery(column, query, statsFilters)
}

export const AutoQAAgentsTable = () => {
    const dispatch = useAppDispatch()
    const {
        currentPage,
        perPage,
        agents: paginatedAgents,
        allAgents: agents,
    } = useAppSelector(getPaginatedAutoQAAgents)
    const statsFilters = useStatsFilters()
    const isHeatmapMode = useAppSelector(getHeatmapMode)
    const isSortingLoading = useAppSelector(isSortingMetricLoading)
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

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{ width }}>
                    <TableHead>
                        {AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER.map(
                            (column, index) => (
                                <AgentsHeaderCellContent
                                    key={`header-cell-${column}`}
                                    title={TableLabels[column]}
                                    hint={AutoQAAgentsColumnConfig[column].hint}
                                    useSortingQuery={getSortingQuery(
                                        column,
                                        statsFilters,
                                    )}
                                    width={getColumnWidth(column)}
                                    justifyContent={getColumnAlignment(column)}
                                    className={classNames(css.BodyCell, {
                                        [css.withShadow]:
                                            index === 0 && isTableScrolled,
                                    })}
                                ></AgentsHeaderCellContent>
                            ),
                        )}
                    </TableHead>
                    <TableBody>
                        {paginatedAgents.map((agent) => (
                            <TableBodyRow key={agent.id}>
                                {AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER.map(
                                    (column) => (
                                        <React.Fragment key={column}>
                                            {React.createElement(
                                                getTableCell(column),
                                                {
                                                    agent,
                                                    useMetricPerAgentQueryHook:
                                                        getQuery(column),
                                                    metricFormat:
                                                        AutoQAAgentsColumnConfig[
                                                            column
                                                        ].format,
                                                    drillDownMetricData:
                                                        getDrillDownMetricData(
                                                            column,
                                                            agent,
                                                        ),
                                                    statsFilters: statsFilters,
                                                    isHeatmapMode:
                                                        isHeatmapMode,
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
                                                                        AutoQAAgentsTableColumn.AgentName &&
                                                                    isTableScrolled,
                                                            },
                                                        ),
                                                        innerClassName:
                                                            css.BodyCellContent,
                                                    },
                                                },
                                            )}
                                        </React.Fragment>
                                    ),
                                )}
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {agents.length >= perPage && (
                    <NumberedPagination
                        count={Math.ceil(agents.length / perPage)}
                        page={currentPage}
                        onChange={onPageChangeCallback}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}
