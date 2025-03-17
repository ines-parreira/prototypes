import React from 'react'

import classNames from 'classnames'

import { User } from 'config/types/user'
import { StatsFilters } from 'models/stat/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import css from 'pages/stats/AnalyticsTable.less'
import {
    getColumnAlignment,
    getColumnWidth,
    getSummaryQuery,
    getTotalsQuery,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { AgentsTableSummaryCell } from 'pages/stats/support-performance/agents/AgentsTableSummaryCell'
import { AgentsTableTotalsCell } from 'pages/stats/support-performance/agents/AgentsTableTotalsCell'
import { AgentsTableColumn, AgentsTableRow } from 'state/ui/stats/types'

export const aggregateRowConfig = {
    [AgentsTableRow.Average]: {
        CellComponent: AgentsTableSummaryCell,
        getQuery: getSummaryQuery,
    },
    [AgentsTableRow.Total]: {
        CellComponent: AgentsTableTotalsCell,
        getQuery: getTotalsQuery,
    },
}

export type AggregateRowType = keyof typeof aggregateRowConfig

type AgentsSummaryProps = {
    isTableScrolled: boolean
    statsFilters: {
        cleanStatsFilters: StatsFilters
        userTimezone: string
    }
    agents: User[]
    type: AggregateRowType
    isEmphasized?: boolean
}

const AgentsSummaryColumn = ({
    column,
    type,
    isTableScrolled,
    statsFilters,
    agents,
    isEmphasized,
}: AgentsSummaryProps & { column: AgentsTableColumn }) => {
    const { CellComponent, getQuery } = aggregateRowConfig[type]

    const isHeaderColumn = column === AgentsTableColumn.AgentName

    const useQuery = getQuery(column)
    const { data, isFetching } = useQuery(
        statsFilters.cleanStatsFilters,
        statsFilters.userTimezone,
    )
    return (
        <BodyCell
            key={column}
            width={getColumnWidth(column)}
            isHighlighted
            justifyContent={getColumnAlignment(column)}
            className={classNames(css.BodyCell, css.highlight, {
                [css.withShadow]: isHeaderColumn && isTableScrolled,
            })}
            innerClassName={classNames(
                css.BodyCellContent,
                isEmphasized && css.bold,
            )}
            isLoading={isFetching}
        >
            <CellComponent
                data={data}
                column={column}
                agentsLength={agents.length}
            />
        </BodyCell>
    )
}

export const AgentsSummaryRow = ({
    columns,
    isTableScrolled,
    isEmphasized,
    statsFilters,
    agents,
    type,
}: AgentsSummaryProps & { columns: AgentsTableColumn[] }) => {
    return (
        <TableBodyRow>
            {columns.map((column) => (
                <AgentsSummaryColumn
                    column={column}
                    type={type}
                    isTableScrolled={isTableScrolled}
                    isEmphasized={isEmphasized}
                    statsFilters={statsFilters}
                    agents={agents}
                    key={column}
                />
            ))}
        </TableBodyRow>
    )
}
