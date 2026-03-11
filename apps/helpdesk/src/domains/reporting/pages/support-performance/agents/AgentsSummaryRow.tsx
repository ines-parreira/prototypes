import classNames from 'classnames'

import type { User } from 'config/types/user'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import { AgentsTableAverageCell } from 'domains/reporting/pages/support-performance/agents/AgentsTableAverageCell'
import {
    getAverageQuery,
    getColumnAlignment,
    getColumnWidth,
    getTotalsQuery,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AgentsTableTotalsCell } from 'domains/reporting/pages/support-performance/agents/AgentsTableTotalsCell'
import {
    AgentsTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

export const aggregateRowConfig = {
    [AgentsTableRow.Average]: {
        CellComponent: AgentsTableAverageCell,
        getQuery: getAverageQuery,
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
        {
            ...statsFilters.cleanStatsFilters,
            /**
             * For summary row, we want to only consider tickets with a non null assignee,
             * otherwise the average and total values will be skewed by unassigned tickets.
             */
            agents: withLogicalOperator([], LogicalOperatorEnum.NOT_ONE_OF),
        },
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
