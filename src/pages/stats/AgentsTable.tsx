import React from 'react'
import {useDispatch} from 'react-redux'
import {NumberedPagination} from 'pages/common/components/Paginations'

import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'
import {ClosedTicketsCellContent} from 'pages/stats/ClosedTicketsCellContent'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {FirstResponseTimeCellContent} from 'pages/stats/FirstResponseTimeCellContent'
import {AgentCellContent} from 'pages/stats/AgentCellContent'
import {ResolutionTimeCellContent} from 'pages/stats/ResolutionTimeCellContent'
import {CustomerSatisfactionCellContent} from 'pages/stats/CustomerSatisfactionCellContent'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'
import {AgentsHeaderCellContent} from 'pages/stats/AgentsHeaderCellContent'
import {TableColumnsOrder} from 'pages/stats/TableConfig'
import {PercentageOfClosedTicketsCellSummary} from 'pages/stats/PercentageOfClosedTicketsCellSummary'
import {CustomerSatisfactionCellSummary} from 'pages/stats/CustomerSatisfactionCellSummary'
import {FirstResponseTimeCellSummary} from 'pages/stats/FirstResponseTimeCellSummary'
import {ResolutionTimeCellSummary} from 'pages/stats/ResolutionTimeCellSummary'
import {TicketsRepliedCellSummary} from 'pages/stats/TicketsRepliedCellSummary'
import {ClosedTicketsCellSummary} from 'pages/stats/ClosedTicketsCellSummary'
import {MessagesSentCellSummary} from 'pages/stats/MessagesSentCellSummary'
import {SummaryCell} from 'pages/stats/SummaryCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import useAppSelector from 'hooks/useAppSelector'
import {
    pageSet,
    getPaginatedAgents,
    getSortedAgents,
} from 'state/ui/stats/agentPerformanceSlice'
import {User} from 'config/types/user'
import {TableColumn} from 'state/ui/stats/types'

const getCell = (
    column: TableColumn
): React.FunctionComponent<{agentId: number}> => {
    switch (column) {
        case TableColumn.RepliedTickets:
            return TicketsRepliedCellContent
        case TableColumn.ClosedTickets:
            return ClosedTicketsCellContent
        case TableColumn.PercentageOfClosedTickets:
            return PercentageOfClosedTicketsCellContent
        case TableColumn.MessagesSent:
            return MessagesSentCellContent
        case TableColumn.FirstResponseTime:
            return FirstResponseTimeCellContent
        case TableColumn.CustomerSatisfaction:
            return CustomerSatisfactionCellContent
        case TableColumn.AgentName:
            return AgentCellContent
        case TableColumn.ResolutionTime:
            return ResolutionTimeCellContent
    }
}

const getSummaryCell = (column: TableColumn): React.FC => {
    switch (column) {
        case TableColumn.RepliedTickets:
            return TicketsRepliedCellSummary
        case TableColumn.ClosedTickets:
            return ClosedTicketsCellSummary
        case TableColumn.PercentageOfClosedTickets:
            return PercentageOfClosedTicketsCellSummary
        case TableColumn.MessagesSent:
            return MessagesSentCellSummary
        case TableColumn.FirstResponseTime:
            return FirstResponseTimeCellSummary
        case TableColumn.CustomerSatisfaction:
            return CustomerSatisfactionCellSummary
        case TableColumn.ResolutionTime:
            return ResolutionTimeCellSummary
        case TableColumn.AgentName:
        default:
            return SummaryCell
    }
}

export const AgentsTable = () => {
    const agents = useAppSelector<Pick<User, 'id'>[]>(getSortedAgents)
    const {
        currentPage,
        perPage,
        agents: paginatedAgents,
    } = useAppSelector(getPaginatedAgents)
    const dispatch = useDispatch()
    const onPageChangeCallback = (page: number) => {
        dispatch(pageSet(page))
    }

    return (
        <div>
            <TableWrapper>
                <TableHead>
                    {TableColumnsOrder.map((column) => (
                        <HeaderCell key={`header-cell-${column}`}>
                            <AgentsHeaderCellContent column={column} />
                        </HeaderCell>
                    ))}
                </TableHead>
                <TableBody>
                    <TableBodyRow>
                        {TableColumnsOrder.map((column) => (
                            <BodyCell key={column}>
                                {React.createElement(getSummaryCell(column), {
                                    key: `summary-${column}`,
                                })}
                            </BodyCell>
                        ))}
                    </TableBodyRow>
                    {paginatedAgents.map((agent) => (
                        <TableBodyRow key={agent.id}>
                            {TableColumnsOrder.map((column) => (
                                <BodyCell key={column}>
                                    {React.createElement(getCell(column), {
                                        agentId: agent.id,
                                        key: `${column}-${agent.id}`,
                                    })}
                                </BodyCell>
                            ))}
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
            {agents.length >= perPage && (
                <NumberedPagination
                    count={Math.ceil(agents.length / perPage)}
                    page={currentPage}
                    onChange={onPageChangeCallback}
                />
            )}
        </div>
    )
}
