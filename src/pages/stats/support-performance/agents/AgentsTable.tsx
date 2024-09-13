import classNames from 'classnames'
import React, {FunctionComponent, UIEventHandler, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useAgentsSortingQuery} from 'hooks/reporting/useAgentsSortingQuery'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import useAppSelector from 'hooks/useAppSelector'
import useMeasure from 'hooks/useMeasure'
import {NumberedPagination} from 'pages/common/components/Paginations'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/AnalyticsTable.less'
import {AgentNameCellContent} from 'pages/stats/support-performance/agents/AgentNameCellContent'
import {
    AgentsCellContent,
    AgentsCellContentProps,
} from 'pages/stats/support-performance/agents/AgentsCellContent'
import {AgentsHeaderCellContent} from 'pages/stats/support-performance/agents/AgentsHeaderCellContent'
import {
    AgentsColumnConfig,
    getColumnAlignment,
    getColumnWidth,
    getDrillDownMetricData,
    getQuery,
    getSummaryQuery,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {AgentsTableSummaryCell} from 'pages/stats/support-performance/agents/AgentsTableSummaryCell'
import {getPaginatedAgents, pageSet} from 'state/ui/stats/agentPerformanceSlice'
import {AgentsTableColumn} from 'state/ui/stats/types'

export const getTableCell = (
    column: AgentsTableColumn
): FunctionComponent<AgentsCellContentProps> => {
    if (column === AgentsTableColumn.AgentName) {
        return AgentNameCellContent
    }
    return AgentsCellContent
}

const getSortingQuery = (column: AgentsTableColumn) => {
    const query = getQuery(column)

    return () => useAgentsSortingQuery(column, query)
}

export const AgentsTable = () => {
    const dispatch = useDispatch()
    const {columnsOrder} = useAgentsTableConfigSetting()
    const {
        currentPage,
        perPage,
        agents: paginatedAgents,
        allAgents: agents,
    } = useAppSelector(getPaginatedAgents)
    const onPageChangeCallback = (page: number) => {
        dispatch(pageSet(page))
    }

    const [ref, {width}] = useMeasure<HTMLDivElement>()
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
                <TableWrapper className={css.table} style={{width}}>
                    <TableHead>
                        {columnsOrder.map((column, index) => (
                            <AgentsHeaderCellContent
                                key={`header-cell-${column}`}
                                title={TableLabels[column]}
                                hint={AgentsColumnConfig[column].hint}
                                useSortingQuery={getSortingQuery(column)}
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
                        <TableBodyRow>
                            {columnsOrder.map((column) => (
                                <BodyCell
                                    key={column}
                                    width={getColumnWidth(column)}
                                    isHighlighted
                                    justifyContent={getColumnAlignment(column)}
                                    className={classNames(css.BodyCell, {
                                        [css.withShadow]:
                                            column ===
                                                AgentsTableColumn.AgentName &&
                                            isTableScrolled,
                                        [css.highlight]: true,
                                    })}
                                    innerClassName={css.BodyCellContent}
                                >
                                    <AgentsTableSummaryCell
                                        useMetric={getSummaryQuery(column)}
                                        column={column}
                                    />
                                </BodyCell>
                            ))}
                        </TableBodyRow>
                        {paginatedAgents.map((agent) => (
                            <TableBodyRow key={agent.id}>
                                {columnsOrder.map((column) => (
                                    <React.Fragment key={column}>
                                        {React.createElement(
                                            getTableCell(column),
                                            {
                                                agent,
                                                useMetricPerAgentQueryHook:
                                                    getQuery(column),
                                                metricFormat:
                                                    AgentsColumnConfig[column]
                                                        .format,
                                                drillDownMetricData:
                                                    getDrillDownMetricData(
                                                        column,
                                                        agent
                                                    ),
                                                bodyCellProps: {
                                                    width: getColumnWidth(
                                                        column
                                                    ),
                                                    justifyContent:
                                                        getColumnAlignment(
                                                            column
                                                        ),
                                                    className: classNames(
                                                        css.BodyCell,
                                                        {
                                                            [css.withShadow]:
                                                                column ===
                                                                    AgentsTableColumn.AgentName &&
                                                                isTableScrolled,
                                                        }
                                                    ),
                                                    innerClassName:
                                                        css.BodyCellContent,
                                                },
                                            }
                                        )}
                                    </React.Fragment>
                                ))}
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
