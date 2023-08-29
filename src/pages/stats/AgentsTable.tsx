import classNames from 'classnames'
import React, {PropsWithRef, UIEventHandler, useState} from 'react'
import {useDispatch} from 'react-redux'
import useMeasure from 'react-use/lib/useMeasure'
import {User} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {NumberedPagination} from 'pages/common/components/Paginations'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {AgentCellContent} from 'pages/stats/AgentCellContent'
import {AgentsHeaderCellContent} from 'pages/stats/AgentsHeaderCellContent'
import css from 'pages/stats/AgentsTable.less'
import {ClosedTicketsCellContent} from 'pages/stats/ClosedTicketsCellContent'
import {ClosedTicketsCellSummary} from 'pages/stats/ClosedTicketsCellSummary'
import {CustomerSatisfactionCellContent} from 'pages/stats/CustomerSatisfactionCellContent'
import {CustomerSatisfactionCellSummary} from 'pages/stats/CustomerSatisfactionCellSummary'
import {FirstResponseTimeCellContent} from 'pages/stats/FirstResponseTimeCellContent'
import {FirstResponseTimeCellSummary} from 'pages/stats/FirstResponseTimeCellSummary'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {MessagesSentCellSummary} from 'pages/stats/MessagesSentCellSummary'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'
import {PercentageOfClosedTicketsCellSummary} from 'pages/stats/PercentageOfClosedTicketsCellSummary'
import {ResolutionTimeCellContent} from 'pages/stats/ResolutionTimeCellContent'
import {ResolutionTimeCellSummary} from 'pages/stats/ResolutionTimeCellSummary'
import {SummaryCell} from 'pages/stats/SummaryCell'
import {
    getColumnAlignment,
    getColumnWidth,
    TableColumnsOrder,
} from 'pages/stats/TableConfig'

import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'
import {TicketsRepliedCellSummary} from 'pages/stats/TicketsRepliedCellSummary'
import {
    getPaginatedAgents,
    getSortedAgents,
    pageSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {TableColumn} from 'state/ui/stats/types'

const getCell = (
    column: TableColumn
): React.FunctionComponent<{
    agentId: number
    bodyCellProps: PropsWithRef<BodyCellProps>
}> => {
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
                        {TableColumnsOrder.map((column, index) => (
                            <AgentsHeaderCellContent
                                key={`header-cell-${column}`}
                                width={getColumnWidth(column)} //TODO: consider introducing common props per cell type (header, average, body)
                                justifyContent={getColumnAlignment(column)}
                                className={classNames({
                                    [css.withShadow]:
                                        index === 0 && isTableScrolled,
                                })}
                                column={column}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        <TableBodyRow>
                            {TableColumnsOrder.map((column) => (
                                <BodyCell
                                    key={column}
                                    width={getColumnWidth(column)}
                                    isHighlighted
                                    justifyContent={getColumnAlignment(column)}
                                    className={classNames({
                                        [css.withShadow]:
                                            column === TableColumn.AgentName &&
                                            isTableScrolled,
                                        [css.highlight]: true, //TODO: looks duplicative to isHighlighted
                                    })}
                                >
                                    {React.createElement(
                                        getSummaryCell(column)
                                    )}
                                </BodyCell>
                            ))}
                        </TableBodyRow>
                        {paginatedAgents.map((agent) => (
                            <TableBodyRow key={agent.id}>
                                {TableColumnsOrder.map((column) => (
                                    <React.Fragment key={column}>
                                        {React.createElement(getCell(column), {
                                            agentId: agent.id,
                                            bodyCellProps: {
                                                width: getColumnWidth(column),
                                                justifyContent:
                                                    getColumnAlignment(column),
                                                className: classNames({
                                                    [css.withShadow]:
                                                        column ===
                                                            TableColumn.AgentName &&
                                                        isTableScrolled,
                                                }),
                                            },
                                        })}
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
