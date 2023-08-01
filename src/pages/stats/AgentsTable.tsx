import React from 'react'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'

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
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import useAppSelector from 'hooks/useAppSelector'
import {selectSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
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
        default:
            return AgentCellContent
    }
}

export const AgentsTable = () => {
    const agents = useAppSelector<Pick<User, 'id'>[]>(selectSortedAgents)

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
                    {agents.map((agent) => (
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
        </div>
    )
}
