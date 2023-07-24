import React from 'react'
import {FirstResponseTimeCellContent} from 'pages/stats/FirstResponseTimeCellContent'
import {User} from 'config/types/user'
import {HeaderCell} from 'pages/stats/HeaderCell'
import {TableColumn, TableColumnsOrder} from 'pages/stats/TableConfig'
import {AgentPlaceholderCell} from 'pages/stats/AgentPlaceholderCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'

const getCell = (
    column: TableColumn
): React.FunctionComponent<{agentId: number}> => {
    switch (column) {
        case TableColumn.FirstResponseTime:
            return FirstResponseTimeCellContent
        default:
            return AgentPlaceholderCell
    }
}

export const AgentsTable = () => {
    const agents: Pick<User, 'id'>[] = []

    return (
        <div>
            <TableWrapper>
                <TableHead>
                    {TableColumnsOrder.map((column) => (
                        <HeaderCell
                            key={`header-cell-${column}`}
                            column={column}
                        />
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
